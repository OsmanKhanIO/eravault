import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import VaultTable from "@/components/dashboard/vault-table"

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) {
    redirect("/sign-in")
  }

  // 1. Fetch Assets (Exclude Trash)
  const rawAssets = await db.asset.findMany({
    where: { userId: user.id, isDeleted: false },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Fetch Folders for the Move Modal
  const folders = await db.folder.findMany({
    where: { userId: user.id },
    select: { id: true, name: true }, // We only need id and name for the dropdown
    orderBy: { name: 'asc' }
  })

  // 🚀 FIXED MAPPING: Explicitly handle Prisma's null values for the client component
  const userAssets = rawAssets.map(asset => ({
    ...asset,
    bytes: Number(asset.bytes),
    tags: asset.tags || [],
    colorHex: asset.colorHex || "#000000"
  }))

  const totalImages = userAssets.length
  const totalBytes = userAssets.reduce((sum, asset) => sum + asset.bytes, 0)
  
  const storageGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2)
  const storageMB = (totalBytes / (1024 * 1024)).toFixed(1)
  const displayStorage = totalBytes > (1024 * 1024 * 1024) 
    ? { value: storageGB, unit: 'GB' } 
    : { value: storageMB, unit: 'MB' }

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-1 md:mb-2">Overview</h1>
        <p className="text-neutral-500 text-xs md:text-sm">Manage your master archives and high-fidelity media.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-[#050505] border border-white/10 p-4 md:p-6 flex flex-col justify-between h-28 md:h-32 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full -mr-12 -mt-12 pointer-events-none" />
          <p className="text-[10px] md:text-xs text-neutral-500 font-medium uppercase tracking-widest relative z-10">Storage</p>
          <p className="text-2xl md:text-3xl font-light text-white relative z-10">{displayStorage.value} <span className="text-sm md:text-lg text-neutral-600">{displayStorage.unit}</span></p>
        </div>
        <div className="bg-[#050505] border border-white/10 p-4 md:p-6 flex flex-col justify-between h-28 md:h-32 rounded-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full -mr-12 -mt-12 pointer-events-none" />
          <p className="text-[10px] md:text-xs text-neutral-500 font-medium uppercase tracking-widest relative z-10">Images</p>
          <p className="text-2xl md:text-3xl font-light text-white relative z-10">{totalImages}</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-[#050505] border border-white/10 p-4 md:p-6 flex flex-col justify-between h-28 md:h-32 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full -mr-12 -mt-12 pointer-events-none" />
          <p className="text-[10px] md:text-xs text-neutral-500 font-medium uppercase tracking-widest relative z-10">Folders</p>
          <p className="text-2xl md:text-3xl font-light text-white relative z-10">{folders.length}</p>
        </div>
      </div>

      {/* TABLE NOW HAS FOLDERS INJECTED */}
      <VaultTable initialAssets={userAssets} folders={folders} />
      
    </div>
  )
}