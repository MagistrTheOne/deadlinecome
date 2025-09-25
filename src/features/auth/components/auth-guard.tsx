"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loading } from "@/components/common/loading";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/sign-in" }: AuthGuardProps) {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session && !error) {
      router.push(redirectTo);
    }
  }, [session, isPending, error, router, redirectTo]);

  if (isPending) {
    return <Loading />;
  }

  if (error || !session) {
    return null;
  }

  return <>{children}</>;
}
