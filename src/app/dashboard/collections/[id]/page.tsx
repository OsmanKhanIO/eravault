import { currentUser } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import FolderHeader from "@/components/dashboard/folder-header"
import dynamic from 'next/dynamic'

// 🔥 LAZY LOAD THE WORKSPACE CODE
// The JS for the grid, drag-and-drop, and modals will not block the initial page load.
const FolderWorkspace = dynamic(() => import("@/components/dashboard/folder-workspace"), {
  loading: () => (
    <div className="w-full h-96 border border-white/5 bg-white/[0.02] rounded-xl animate-pulse flex items-center justify-center text-neutral-600 text-sm">
      Loading Workspace...
    </div>
  )
})

export default async function SingleFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const resolvedParams = await params
  const folderId = resolvedParams.id

  const folder = await db.folder.findUnique({
    where: { id: folderId, userId: user.id }
  })
  
  if (!folder) notFound()

  const rawAssets = await db.asset.findMany({
    where: { folderId: folder.id, userId: user.id, isDeleted: false },
    orderBy: { createdAt: 'desc' }
  })

  const allFolders = await db.folder.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  const folderAssets = rawAssets.map(asset => ({ ...asset, bytes: Number(asset.bytes) }))
  const totalFolderBytes = folderAssets.reduce((sum, asset) => sum + asset.bytes, 0)

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto h-full flex flex-col">
      <FolderHeader 
        folderId={folder.id}
        folderName={folder.name}
        itemCount={folderAssets.length}
        totalBytes={totalFolderBytes}
        assets={folderAssets}
      />
      <div className="flex-1">
        <FolderWorkspace 
          folderId={folder.id} 
          initialAssets={folderAssets} 
          allFolders={allFolders} 
        />
      </div>
    </div>
  )
}