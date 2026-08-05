import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"

export const runtime = 'edge'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { isDeleted } = body

    const resolvedParams = await params

    const asset = await db.asset.findUnique({
      where: {
        id: resolvedParams.id,
        userId: user.id
      }
    })

    if (!asset) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const updatedAsset = await db.asset.update({
      where: {
        id: resolvedParams.id
      },
      data: {
        isDeleted
      }
    })

    // 🚀 FIX: Convert the BigInt 'bytes' to a Number before sending JSON
    const serializedAsset = {
      ...updatedAsset,
      bytes: Number(updatedAsset.bytes)
    }

    return NextResponse.json(serializedAsset)

  } catch (error) {
    console.error("[ASSET_UPDATE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const resolvedParams = await params

    const asset = await db.asset.findUnique({
      where: {
        id: resolvedParams.id,
        userId: user.id
      }
    })

    if (!asset) {
      return new NextResponse("Not Found", { status: 404 })
    }

    await db.asset.delete({
      where: {
        id: resolvedParams.id
      }
    })

    return new NextResponse("Deleted", { status: 200 })
  } catch (error) {
    console.error("[ASSET_DELETE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}