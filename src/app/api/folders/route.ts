import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    // 1. Enterprise Security Check
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 2. Get the folder name from the modal
    const body = await req.json()
    const { name } = body

    if (!name || typeof name !== 'string') {
      return new NextResponse("Folder name is required", { status: 400 })
    }

    // 3. Create the folder in the Neon Database
    const folder = await db.folder.create({
      data: {
        userId,
        name,
      }
    })

    // 🚀 FORCE CLOUDFLARE EDGE TO PURGE STALE HTML CACHE
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/collections")

    return NextResponse.json(folder)

  } catch (error) {
    console.error("[FOLDER_CREATE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}