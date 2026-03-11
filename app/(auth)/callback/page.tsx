"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        console.error("Auth callback error:", error);
        router.push("/login?error=auth_failed");
        return;
      }

      router.push("/overview");
    };

    handleCallback();
  }, [router]);

  return (
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-400 text-sm">Connecting your GitHub...</p>
    </div>
  );
}