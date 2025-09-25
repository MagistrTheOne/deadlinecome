"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to demo workspace after a short delay
    const timer = setTimeout(() => {
      router.push("/w/demo/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Demo...</h1>
        <p className="text-muted-foreground">Redirecting to demo workspace</p>
      </div>
    </div>
  );
}
