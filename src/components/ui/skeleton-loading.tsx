"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-white/10 rounded backdrop-blur-sm ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Section Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Activity Section Skeleton */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Additional Sections Skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table Header */}
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
          </div>
          
          {/* Table Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-black/30 border border-white/10">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}
