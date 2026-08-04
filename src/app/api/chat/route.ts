import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

const SYSTEM_PROMPT = `You are ERA, the friendly and ultra-secure AI assistant for EraVault. 
EraVault is a premium cloud backup platform optimized for archiving high-resolution media and digital assets.

YOUR PERSONALITY & TONE:
- Speak in simple, welcoming, and easy-to-understand English. 
- Be incredibly helpful and polite, like a high-end concierge.
- Keep your answers short, structured, and to the point.
- NEVER introduce yourself constantly.
- NEVER say "As an AI..." or "I don't have context...". 

SYSTEM KNOWLEDGE & PROTOCOLS:
- Privacy: EraVault uses zero-trust security. Only the user can see their files.
- Formats: EraVault STRICTLY ONLY supports image formats up to 32MB. No videos are supported.
- Agentic Actions: You have tools to read and modify the vault. Use them whenever requested!
- Formatting Data: When summarizing storage, always format bytes into clear MB or GB. Present search results in clean, scannable bullet points.

Respond to the user's latest query adhering strictly to this persona.`;

// 🛠️ THE ENTERPRISE TOOLKIT
const tools = [
  {
    type: "function",
    function: {
      name: "create_folder",
      description: "Creates a new secure folder/collection in the user's vault.",
      parameters: {
        type: "object",
        properties: { folder_name: { type: "string" } },
        required: ["folder_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_folder",
      description: "Deletes a specific folder from the user's vault by name.",
      parameters: {
        type: "object",
        properties: { folder_name: { type: "string" } },
        required: ["folder_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_vault_summary",
      description: "Retrieves a summary of the entire vault, including total storage used, number of assets, and a list of all folders.",
      parameters: { type: "object", properties: {} } // No parameters needed
    }
  },
  {
    type: "function",
    function: {
      name: "search_vault",
      description: "Searches the user's assets by filename or AI-generated tags (e.g., searching for 'action', 'poster', or specific names).",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "The search term" } },
        required: ["query"]
      }
    }
  }
];

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) return new NextResponse("Unauthorized", { status: 401 })

    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) return new NextResponse("Invalid format", { status: 400 })

    // 🚀 FIXED TYPESCRIPT: Using any[] bypasses strict structural locking
    let payloadMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ]

    let responseText = ""
    let success = false
    let needsRefresh = false // 🚀 Track if the UI needs to soft-reload

    try {
      console.log("[ERA Gateway] Routing to Primary Engine (Groq)...")
      
      // FIRST PASS: Ask Groq what to do
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", 
          messages: payloadMessages,
          tools: tools,
          tool_choice: "auto",
          temperature: 0.2,
          max_tokens: 800
        })
      })

      if (!groqRes.ok) throw new Error(`Groq Error: ${await groqRes.text()}`)
      const groqData = await groqRes.json()
      const responseMessage = groqData.choices[0].message

      // 🤖 TOOL EXECUTION PIPELINE
      if (responseMessage.tool_calls) {
        payloadMessages.push(responseMessage)

        for (const toolCall of responseMessage.tool_calls) {
          const args = toolCall.function.arguments ? JSON.parse(toolCall.function.arguments) : {}
          let toolResult = {}

          try {
            // ACTION 1: CREATE FOLDER
            if (toolCall.function.name === "create_folder") {
              await db.folder.create({ data: { name: args.folder_name, userId: user.id } })
              toolResult = { success: true, message: `Folder '${args.folder_name}' created.` }
              needsRefresh = true // Flag UI refresh
            }
            
            // ACTION 2: DELETE FOLDER
            else if (toolCall.function.name === "delete_folder") {
              const target = await db.folder.findFirst({ where: { userId: user.id, name: args.folder_name } })
              if (!target) throw new Error("Folder not found.")
              await db.folder.delete({ where: { id: target.id } })
              toolResult = { success: true, message: `Folder '${args.folder_name}' deleted.` }
              needsRefresh = true // Flag UI refresh
            }

            // ACTION 3: GET VAULT SUMMARY
            else if (toolCall.function.name === "get_vault_summary") {
              const folders = await db.folder.findMany({ where: { userId: user.id }, select: { name: true } })
              const assets = await db.asset.findMany({ where: { userId: user.id, isDeleted: false }, select: { bytes: true } })
              
              const totalBytes = assets.reduce((sum, a) => sum + Number(a.bytes), 0)
              
              toolResult = { 
                total_assets: assets.length,
                total_bytes_raw: totalBytes,
                folder_count: folders.length,
                folder_names: folders.map(f => f.name)
              }
            }

            // ACTION 4: SEARCH VAULT
            else if (toolCall.function.name === "search_vault") {
              const query = args.query.toLowerCase()
              const rawAssets = await db.asset.findMany({ where: { userId: user.id, isDeleted: false } })
              
              // Search through filename and tags
              const matches = rawAssets.filter(a => 
                a.filename.toLowerCase().includes(query) || 
                (a.tags && a.tags.some(tag => tag.toLowerCase().includes(query)))
              ).map(a => ({ name: a.filename, tags: a.tags }))

              toolResult = { 
                matches_found: matches.length,
                top_results: matches.slice(0, 10) // Limit to 10 so we don't crash AI context limit
              }
            }

            // Report success to the AI
            payloadMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify(toolResult)
            })

          } catch (dbError: any) {
            console.error(`[ERA Gateway] DB Error (${toolCall.function.name}):`, dbError)
            payloadMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify({ success: false, error: dbError.message })
            })
          }
        }

        // SECOND PASS: Let Groq read the DB data and format a reply
        const secondGroqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile", 
            messages: payloadMessages,
            temperature: 0.2,
            max_tokens: 800
          })
        })

        if (!secondGroqRes.ok) throw new Error(`Groq Error (Pass 2): ${await secondGroqRes.text()}`)
        const secondGroqData = await secondGroqRes.json()
        responseText = secondGroqData.choices[0].message.content

      } else {
        responseText = responseMessage.content
      }

      success = true
    } catch (groqError: any) {
      console.warn(`[ERA Gateway] Groq failed -> ${groqError.message}`)
      
      // FALLBACK ENGINE
      const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID
      const cfApiToken = process.env.CLOUDFLARE_API_TOKEN
      if (!cfAccountId || !cfApiToken) throw new Error("Cloudflare keys missing")

      const cfMessages = payloadMessages.filter(m => m.role !== 'tool' && !m.tool_calls)
      const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/v1/chat/completions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${cfApiToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "@cf/google/gemma-7b-it", messages: cfMessages, max_tokens: 500 })
      })

      if (!cfRes.ok) throw new Error(`Cloudflare API Error: ${await cfRes.text()}`)
      const cfData = await cfRes.json()
      responseText = cfData.choices[0].message.content
      success = true
    }

    if (!success) throw new Error("All Chat AI gateways offline.")

    // 🚀 Return response including the needsRefresh flag
    return NextResponse.json({ role: "assistant", content: responseText, needsRefresh })

  } catch (error: any) {
    console.error("[CHAT_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}