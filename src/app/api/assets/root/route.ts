import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const assets = await db.asset.findMany({
      where: {
        userId: user.id,
        folderId: null, // Only fetch unassigned assets from root vault
        isDeleted: false
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // 🚀 FIX: Explicitly typed 'a' as any to satisfy TypeScript strict mode
    const serializedAssets = assets.map((a: any) => ({
      ...a,
      bytes: Number(a.bytes)
    }))

    return NextResponse.json(serializedAssets)
  } catch (error) {
    console.error("[ROOT_ASSETS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}