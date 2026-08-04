import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const body = await req.json()
    const { assetIds, action, folderId } = body // action: 'move' | 'trash'

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return new NextResponse("No assets provided", { status: 400 })
    }

    if (action === 'move') {
      await db.asset.updateMany({
        where: { id: { in: assetIds }, userId },
        data: { folderId: folderId || null } // null moves it back to main vault
      })
    } else if (action === 'trash') {
      await db.asset.updateMany({
        where: { id: { in: assetIds }, userId },
        data: { isDeleted: true, deletedAt: new Date() }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("[BULK_ACTION_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}