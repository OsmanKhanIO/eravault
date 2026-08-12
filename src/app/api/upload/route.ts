import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { revalidatePath } from "next/cache"

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) return new NextResponse("Unauthorized", { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folderId = formData.get("folderId") as string | null

    if (!file) return new NextResponse("No file provided", { status: 400 })

    // 🛡️ THE ERAVAULT BOUNCER: Strict Image & Size Constraints
    if (!file.type.startsWith("image/")) {
      return new NextResponse("Unsupported file type. EraVault currently strictly supports image formats.", { status: 400 })
    }

    // Restrict size to 32MB (Imgbb's maximum limit)
    const MAX_FILE_SIZE = 32 * 1024 * 1024 // 32MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse("File too large. Maximum size is 32MB.", { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // We only use base64 for Google Gemini vision analysis.
    const base64Image = buffer.toString("base64")

    // 🚀 EDGE-SAFE SHA-256 HASHING (Web Crypto API)
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    let smartFilename = file.name
    let aiTags: string[] = []
    let dominantColor = "#000000"

    const mimeType = file.type || "image/jpeg"

    // 2. 🚀 THE ERA UNIVERSAL VISION SYSTEM (Zero-Hallucination Edition)
    try {
      console.log(`[AI] Starting Dynamic Vision Analysis for: ${file.name}...`)
      
      // 🧠 THE OMNI-PROMPT v2.0
      // Explicitly forbids guessing to guarantee 99% accuracy for film assets.
      const prompt = `You are an elite, universal computer vision AI for a premium archiving vault. Your mandate is 100% factual accuracy. DO NOT GUESS.

      Perform a rigorous visual scan:
      1. FACES/PEOPLE: Identify celebrities or public figures. CRITICAL RULE: If you are not 100% certain of the person's identity, DO NOT output a name. Never guess based on context.
      2. MEDIA/ART: Identify exact movie titles, album covers, or artistic mediums only if explicitly visible or undeniably recognizable.
      3. TEXT/DOCUMENTS/TECH: Read critical text (e.g., invoices, code, brands) and identify specific tech models (e.g., Samsung Galaxy Note 9) by physical traits.
      4. OBJECTS/VIBE: Identify the core aesthetic, genre, and physical objects.

      Output ONLY a raw JSON object. Do not include markdown, backticks, or placeholder text.
      {
        "filename": "highly-specific-kebab-case-description",
        "tags": ["Confirmed Entity 1", "Confirmed Entity 2", "Exact Category", "Vibe"],
        "color": "#HEXCODE"
      }`

      let responseText = ""
      let success = false

      // ⚖️ THE GOOGLE LOAD BALANCER & FALLBACK CASCADE
      const apiKey = process.env.GEMINI_API_KEY || ""
      const genAI = new GoogleGenerativeAI(apiKey)
      const googleModels = ["gemini-2.0-flash", "gemini-1.5-pro"] 

      // 1. Primary Network (Google Gemini)
      for (const modelName of googleModels) {
        if (success) break
        try {
          console.log(`[AI] Routing to Primary Network -> ${modelName}...`)
          const model = genAI.getGenerativeModel({ model: modelName })
          const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType } }
          ])
          responseText = result.response.text()
          success = true
          console.log(`[AI] Success: Served via ${modelName}.`)
        } catch (error: any) {
          const errMsg = error.message || ""
          if (errMsg.includes("limit: 0")) {
            console.error("\n🚨 [CRITICAL GOOGLE BILLING ERROR] 🚨")
            console.error("You are using a Google Cloud AQ. key. Replace it with a free AIza key from aistudio.google.com.")
            console.error("🚨 -------------------------------- 🚨\n")
          }
          console.warn(`[AI] ${modelName} rejected request. Load balancing...`)
        }
      }

      // 2. Secondary Network (Cloudflare LLaVA Fallback)
      if (!success) {
        console.warn("[AI] Google Primary Network offline. Deploying Cloudflare Fallback...")
        
        const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID
        const cfApiToken = process.env.CLOUDFLARE_API_TOKEN

        if (!cfAccountId || !cfApiToken) throw new Error("Cloudflare keys missing from .env")

        const cfEndpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/llava-hf/llava-1.5-7b-hf`
        const imageByteArray = Array.from(new Uint8Array(buffer))

        const cfRes = await fetch(cfEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${cfApiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: prompt, image: imageByteArray })
        })

        if (!cfRes.ok) throw new Error(`Cloudflare API Error: ${await cfRes.text()}`)

        const cfData = await cfRes.json()
        responseText = cfData.result?.description || ""
        
        if (!responseText) throw new Error("Cloudflare returned an empty description.")
        
        console.log("[AI] Success: Served via Cloudflare Fallback.")
      }
      
      // 🚀 BULLETPROOF JSON EXTRACTOR
      let cleanJson = responseText
      const startIndex = responseText.indexOf('{')
      const endIndex = responseText.lastIndexOf('}')
      
      if (startIndex !== -1 && endIndex !== -1) {
        cleanJson = responseText.substring(startIndex, endIndex + 1)
      }

      const aiData = JSON.parse(cleanJson)

      const ext = file.name.split('.').pop() || mimeType.split('/')[1] || 'jpg'
      const cleanFilename = (aiData.filename || "unnamed-asset").replace(/\.[^/.]+$/, "") 

      smartFilename = `${cleanFilename}.${ext}`
      aiTags = aiData.tags || []
      dominantColor = aiData.color || "#000000"

      console.log(`[AI SUCCESS] Extracted -> ${smartFilename}, Tags:`, aiTags)
    } catch (aiError) {
      console.error("\n================ AI ANALYSIS FAILED ================")
      console.error(aiError)
      console.error("====================================================\n")
    }

    // 3. ☁️ UPLOAD TO IMGBB (Optimized for Edge Memory)
    const imgbbForm = new FormData()
    
    // Pass the raw binary File object directly to avoid Edge Worker memory limits
    imgbbForm.append("image", file) 
    
    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, { 
      method: "POST", 
      body: imgbbForm 
    })
    
    const imgbbData = await imgbbRes.json()
    
    if (!imgbbRes.ok || !imgbbData.success) {
      // 🚀 If ImgBB rejects it, this will print the exact reason to your browser's Network tab
      const errorMessage = imgbbData?.error?.message || "Unknown ImgBB Error"
      console.error("[IMGBB_ERROR]", errorMessage)
      return new NextResponse(`Storage Upload Failed: ${errorMessage}`, { status: 500 })
    }
    
    const fileUrl = imgbbData.data.url

    // 4. 💾 Save to PostgreSQL Database
    const asset = await db.asset.create({
      data: {
        filename: smartFilename,
        originalName: file.name,
        url: fileUrl,
        format: file.type,
        bytes: file.size,
        fileHash: fileHash,
        userId: user.id,
        folderId: folderId || null,
        tags: aiTags,
        colorHex: dominantColor
      }
    })

    // 🚀 PURGE STALE EDGE CACHE SO THE UI UPDATES IMMEDIATELY
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/collections")

    return NextResponse.json({ ...asset, bytes: Number(asset.bytes) })

  } catch (error) {
    console.error("[UPLOAD_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}