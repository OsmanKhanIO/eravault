import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { clerkClient } from "@clerk/nextjs/server"
import { ShieldAlert, Database, Users, HardDrive, PieChart } from "lucide-react"
import AdminDashboardClient from "@/components/dashboard/admin-dashboard-client"

export default async function AdminModerationPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  // 1. GATEKEEPER: Ensure only YOU can view this SaaS control center
  const adminEmail = user.emailAddresses[0].emailAddress
  if (adminEmail !== "gdtotremux+1@gmail.com") { // <--- MAKE SURE THIS MATCHES YOUR CLERK EMAIL
    redirect('/dashboard')
  }

  // 2. FETCH ALL ASSETS IN THE SAAS PIPELINE
  const allAssetsRaw = await db.asset.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // 3. FETCH GLOBAL USER PROFILES FROM CLERK TO RESOLVE NAMES & EMAILS
  let userMap: Record<string, { name: string; email: string; avatar?: string }> = {}
  try {
    const clerk = await clerkClient()
    const clerkUsers = await clerk.users.getUserList({ limit: 100 })
    
    clerkUsers.data.forEach((u) => {
      const firstName = u.firstName || ""
      const lastName = u.lastName || ""
      const fullName = `${firstName} ${lastName}`.trim() || u.username || "Anonymous User"
      const email = u.emailAddresses[0]?.emailAddress || "No email"
      
      userMap[u.id] = {
        name: fullName,
        email: email,
        avatar: u.imageUrl
      }
    })
  } catch (error) {
    console.error("[CLERK_USER_FETCH_FAILED] Rendering placeholder identities.", error)
  }

  // 4. MAP DATA & CALCULATE AGGREGATED ENTERPRISE METRICS
  let totalBytes = 0
  const totalAssets = allAssetsRaw.length
  const uniqueUsersCount = new Set(allAssetsRaw.map(a => a.userId)).size

  const sanitizedAssets = allAssetsRaw.map((asset) => {
    const sizeInBytes = Number(asset.bytes)
    totalBytes += sizeInBytes

    const userProfile = userMap[asset.userId] || {
      name: "External User",
      email: `ID: ${asset.userId.slice(0, 12)}...`,
      avatar: ""
    }

    return {
      id: asset.id,
      filename: asset.filename,
      originalName: asset.originalName,
      url: asset.url,
      format: asset.format.split('/')[1] || 'IMG',
      bytes: sizeInBytes,
      tags: asset.tags || [],
      colorHex: asset.colorHex || "#000000",
      isDeleted: asset.isDeleted,
      createdAt: asset.createdAt.toISOString(),
      user: userProfile
    }
  })

  const formatStorageStr = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i]
  }

  const metricsSummary = {
    totalFiles: totalAssets,
    totalStorageStr: formatStorageStr(totalBytes),
    totalUsers: uniqueUsersCount,
    rawBytes: totalBytes
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 min-h-screen text-white relative selection:bg-red-500/30">
      
      {/* HUD Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight font-sans">Admin Dashboard</h1>
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-[10px] uppercase tracking-widest text-red-400 font-mono font-bold">God Mode</span>
            </div>
            <p className="text-xs md:text-sm text-neutral-400 mt-1 font-sans">Real-time overview of platform usage, storage, and user uploads.</p>
          </div>
        </div>
      </div>

      {/* 🚀 UPGRADED 2x2 METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* ROW 1: PLATFORM VOLUME */}
        <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Assets</span>
            <Database className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-light font-sans tracking-tight">{metricsSummary.totalFiles}</div>
          <p className="text-[10px] text-neutral-500 mt-1 font-sans">Across all workspaces</p>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-500/20 group-hover:bg-neutral-400 transition-colors" />
        </div>

        <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Storage Used</span>
            <HardDrive className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-light font-sans tracking-tight">{metricsSummary.totalStorageStr}</div>
          <p className="text-[10px] text-neutral-500 mt-1 font-sans">Platform data footprint</p>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-500/20 group-hover:bg-neutral-400 transition-colors" />
        </div>

        {/* ROW 2: ACCOUNT HEALTH & LIMITS */}
        <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Active Users</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-light font-sans tracking-tight">{metricsSummary.totalUsers}</div>
          <p className="text-[10px] text-neutral-500 mt-1 font-sans">Registered creators</p>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-500/20 group-hover:bg-neutral-400 transition-colors" />
        </div>

        <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Capacity Limit</span>
            <PieChart className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-light font-sans tracking-tight">
              {Math.min(100, Number(((metricsSummary.rawBytes / (100 * 1024 * 1024 * 1024)) * 100).toFixed(1)))}%
            </div>
            <span className="text-[10px] font-sans text-neutral-500">of 100 GB cap</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-2.5">
            <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (metricsSummary.rawBytes / (100 * 1024 * 1024 * 1024)) * 100)}%` }} />
          </div>
        </div>

      </div>

      <AdminDashboardClient assets={sanitizedAssets} />

    </div>
  )
}