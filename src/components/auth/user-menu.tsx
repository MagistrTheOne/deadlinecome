"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings } from "lucide-react";

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-black border border-white/10 animate-pulse" />
        <div className="h-4 w-20 bg-black border border-white/10 rounded animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/sign-in")}
          className="text-white hover:bg-white/10 border border-white/10"
        >
          Войти
        </Button>
        <Button 
          onClick={() => router.push("/sign-up")}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          Регистрация
        </Button>
      </div>
    );
  }

  const user = session.user;
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full hover:bg-white/10 border border-white/10 transition-all duration-200"
        >
          <Avatar className="h-8 w-8 border border-white/20">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback className="bg-black text-white border border-white/20">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl" 
        align="end" 
        forceMount
      >
        {/* User Info Section with Glassmorphism */}
        <div className="px-3 py-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border border-white/20">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="bg-black text-white border border-white/20">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-white">
                {user.name}
              </p>
              <p className="text-xs leading-none text-white/70">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items with Better Spacing */}
        <div className="py-2">
          <DropdownMenuItem 
            onClick={() => router.push("/profile")}
            className="mx-2 my-1 px-3 py-2 rounded-lg text-white hover:bg-white/10 focus:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            <User className="mr-3 h-4 w-4 text-white/80" />
            <span className="font-medium">Профиль</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => router.push("/settings")}
            className="mx-2 my-1 px-3 py-2 rounded-lg text-white hover:bg-white/10 focus:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            <Settings className="mr-3 h-4 w-4 text-white/80" />
            <span className="font-medium">Настройки</span>
          </DropdownMenuItem>
        </div>

        {/* Separator with Glassmorphism */}
        <div className="mx-3 my-2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Logout Button */}
        <div className="py-2">
          <DropdownMenuItem 
            onClick={handleSignOut} 
            disabled={isLoading}
            className="mx-2 my-1 px-3 py-2 rounded-lg text-white hover:bg-red-500/20 focus:bg-red-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="mr-3 h-4 w-4 text-white/80" />
            <span className="font-medium">
              {isLoading ? "Выход..." : "Выйти"}
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
