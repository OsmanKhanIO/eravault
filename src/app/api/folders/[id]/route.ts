import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// RENAME FOLDER
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })
    
    const resolvedParams = await params
    const { name } = await req.json()

    if (!name || name.trim() === '') {
      return new NextResponse("Name is required", { status: 400 })
    }

    const updatedFolder = await db.folder.update({
      where: { id: resolvedParams.id, userId },
      data: { name: name.trim() }
    })

    return NextResponse.json(updatedFolder)
  } catch (error) {
    console.error("[FOLDER_RENAME_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// DELETE FOLDER
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })
    
    const resolvedParams = await params
    const folderId = resolvedParams.id

    await db.asset.updateMany({
      where: { folderId, userId },
      data: { isDeleted: true, deletedAt: new Date() }
    })

    await db.folder.delete({
      where: { id: folderId, userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[FOLDER_DELETE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}