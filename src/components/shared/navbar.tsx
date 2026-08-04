import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between px-6">
      <div className="flex items-center md:hidden">
        <h1 className="text-xl font-bold tracking-tighter text-white">EraVault</h1>
      </div>
      
      {/* Spacer for desktop */}
      <div className="hidden md:block"></div>

      <div className="flex items-center gap-4">
        {/* Clerk's pre-built profile button (handles sign out automatically) */}
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}