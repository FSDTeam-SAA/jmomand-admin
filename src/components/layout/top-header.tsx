import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BellIcon, SearchIcon } from "@/components/ui/icons";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">J Momand Admin</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-950">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden h-10 w-72 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 md:flex">
          <SearchIcon className="text-slate-400" />
          <span className="text-sm text-slate-400">Search auctions, orders...</span>
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <BellIcon />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-600" />
        </Button>
        <Avatar className="bg-[#061f42] text-white">DM</Avatar>
      </div>
    </header>
  );
}
