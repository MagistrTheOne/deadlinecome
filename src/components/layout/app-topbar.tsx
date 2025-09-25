"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandInput, CommandList } from "@/components/ui/command";
import { Menu, Plus, Search } from "lucide-react";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { UserProfile } from "@/features/auth/components/user-profile";

interface AppTopbarProps {
  onMenuClick: () => void;
}

export function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <WorkspaceSwitcher />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandOpen(true)}
            className="hidden sm:flex"
          >
            <Search className="mr-2 h-4 w-4" />
            Search...
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Issue
          </Button>

          <UserProfile />
        </div>
      </header>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          {/* Command items would go here */}
        </CommandList>
      </CommandDialog>
    </>
  );
}
