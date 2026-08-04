import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-neutral-800">
        <h1 className="text-xl font-bold tracking-tighter text-white">EraVault</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Link 
          href="/dashboard" 
          className="flex items-center px-4 py-3 text-sm font-medium text-neutral-300 rounded-md hover:bg-neutral-900 hover:text-white transition-colors"
        >
          My Vault
        </Link>
        <Link 
          href="/dashboard/upload" 
          className="flex items-center px-4 py-3 text-sm font-medium text-neutral-300 rounded-md hover:bg-neutral-900 hover:text-white transition-colors"
        >
          Upload Asset
        </Link>
      </nav>
    </aside>
  );
}