import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import AssetClient from "@/components/share/asset-client"

export default async function PublicSharedAsset({ params }: { params: Promise<{ id: string, name: string }> }) {
  const resolvedParams = await params
  const assetId = resolvedParams.id 

  if (!assetId) notFound()

  const asset = await db.asset.findUnique({
    where: { id: assetId, isDeleted: false }
  })

  if (!asset) notFound()

  const serializedAsset = { ...asset, bytes: Number(asset.bytes) }
return <AssetClient asset={serializedAsset} />
}