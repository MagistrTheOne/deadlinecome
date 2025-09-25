"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      <Link
        href="/"
        className="flex items-center text-white/60 hover:text-white transition-all duration-200 p-1 rounded hover:bg-white/10"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-white/40" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-white/60 hover:text-white transition-all duration-200 px-2 py-1 rounded hover:bg-white/10"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-medium px-2 py-1 bg-white/10 rounded border border-white/20">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
