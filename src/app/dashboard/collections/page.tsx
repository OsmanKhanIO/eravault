import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Folder as FolderIcon, LayoutGrid } from "lucide-react"
import VaultTable from "@/components/dashboard/vault-table"
import FolderGrid from "@/components/dashboard/folder-grid"

// 🚀 PREVENT CLOUDFLARE EDGE FROM SERVING STALE CACHED DATA
export const dynamic = "force-dynamic"

export default async function CollectionsPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  // 1. Fetch Folders
  const folders = await db.folder.findMany({
    where: { userId: user.id },
    include: { assets: { where: { isDeleted: false } } },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Fetch Unassigned "Root" Assets
  const rawRootAssets = await db.asset.findMany({
    where: { userId: user.id, folderId: null, isDeleted: false },
    orderBy: { createdAt: 'desc' }
  })
  
  // 🚀 THE MILLION-DOLLAR MAPPING: 
  // Explicitly mapping tags and colorHex so the VaultTable can render them
  const rootAssets = rawRootAssets.map((a: any) => ({ 
    id: a.id,
    filename: a.filename,
    url: a.url,
    format: a.format,
    bytes: Number(a.bytes),
    createdAt: a.createdAt,
    folderId: a.folderId,
    tags: a.tags || [],
    colorHex: a.colorHex || "#000000"
  }))

  const plainFolders = folders.map((f: any) => ({ 
    id: f.id, 
    name: f.name 
  }))
  
  const formattedFolders = folders.map((f: any) => ({
    id: f.id,
    name: f.name,
    assetCount: f.assets.length
  }))

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-12 md:space-y-16 h-full">
      
      {/* SECTION 1: FOLDERS */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
            <FolderIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-light tracking-tight text-white">Collections</h2>
        </div>

        <FolderGrid initialFolders={formattedFolders} />
        
      </section>

      {/* SECTION 2: ROOT VAULT TABLE */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-light tracking-tight text-white">Unassigned Assets</h2>
        </div>
        
        <VaultTable 
          initialAssets={rootAssets} 
          folders={plainFolders} 
        />
      </section>
      
    </div>
  )
}