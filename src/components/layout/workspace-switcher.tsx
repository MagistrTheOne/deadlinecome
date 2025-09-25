"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Check, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Workspace } from "@/lib/types";

// Mock workspaces - in real app this would come from API
const workspaces: Workspace[] = [
  { id: "demo", name: "Demo Workspace", slug: "demo" },
  { id: "personal", name: "Personal Projects", slug: "personal" },
];

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace>(workspaces[0]);
  const router = useRouter();

  const handleWorkspaceChange = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setOpen(false);
    router.push(`/w/${workspace.slug}/dashboard`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedWorkspace.name}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup>
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  value={workspace.name}
                  onSelect={() => handleWorkspaceChange(workspace)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedWorkspace.id === workspace.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {workspace.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem>
                <Plus className="mr-2 h-4 w-4" />
                Create workspace
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
