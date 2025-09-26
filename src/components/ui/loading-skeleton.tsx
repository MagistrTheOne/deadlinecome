import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AISkeleton() {
  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 bg-white/20" />
          <Skeleton className="h-6 w-32 bg-white/20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full bg-white/10" />
        <Skeleton className="h-4 w-3/4 bg-white/10" />
        <Skeleton className="h-4 w-1/2 bg-white/10" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 bg-white/10" />
          <Skeleton className="h-8 w-16 bg-white/10" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AIDashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AISkeleton />
      <AISkeleton />
      <AISkeleton />
    </div>
  );
}

export function AIPageSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 bg-white/20 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-48 bg-white/20 mb-2" />
              <Skeleton className="h-4 w-32 bg-white/10" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20 h-[600px] flex flex-col">
              <CardHeader className="border-b border-white/10">
                <Skeleton className="h-6 w-40 bg-white/20" />
              </CardHeader>
              <CardContent className="flex-1 p-6 space-y-4">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-3/4 bg-white/10" />
                <Skeleton className="h-4 w-1/2 bg-white/10" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <AISkeleton />
            <AISkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
