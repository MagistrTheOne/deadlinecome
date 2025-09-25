"use client";

import { redirect } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      redirect("/dashboard");
    } else {
      redirect("/landing");
    }
  }, [session]);

  return null;
}