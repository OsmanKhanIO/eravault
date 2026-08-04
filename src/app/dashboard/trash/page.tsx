import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Trash2 } from "lucide-react"
import TrashClient from "@/components/dashboard/trash-client"

export default async function TrashPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  // Fetch only DELETED assets
  const rawDeletedAssets = await db.asset.findMany({
    where: { userId: user.id, isDeleted: true },
    orderBy: { updatedAt: 'desc' }
  })
  
  const deletedAssets = rawDeletedAssets.map(a => ({ ...a, bytes: Number(a.bytes) }))

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-light tracking-tight text-white">Trash</h2>
          <p className="text-xs md:text-sm text-neutral-500">Deleted items remain here until permanently removed.</p>
        </div>
      </div>
      
      <div className="flex-1">
        <TrashClient initialAssets={deletedAssets} />
      </div>
    </div>
  )
}