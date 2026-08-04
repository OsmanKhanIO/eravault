import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import FolderClient from "@/components/share/folder-client" 

export default async function PublicSharedFolder({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const allFolders = await db.folder.findMany({
    include: { assets: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' } } }
  })

  const folder = allFolders.find((f: any) => f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === resolvedParams.slug)
  if (!folder) notFound()

  // Serialize the BigInt to a standard number for the Client Component
  const serializedAssets = folder.assets.map((a: any) => ({ ...a, bytes: Number(a.bytes) }))

  return <FolderClient folder={folder} assets={serializedAssets} />
}