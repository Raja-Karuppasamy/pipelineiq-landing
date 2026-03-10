"use client";

import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const handleGitHubSignup = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/callback`,
        scopes: "repo read:org",
      },
    });
  };

  return (
    <div style={{
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.03)",
      padding: "32px",
    }}>
      <h1 className="text-2xl font-bold text-white mb-2">Get started free</h1>
      <p className="text-gray-400 text-sm mb-8">
        Connect your GitHub and see your first risk score in 5 minutes
      </p>

      <button
        onClick={handleGitHubSignup}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all"
        style={{ boxShadow: "0 4px 20px rgba(59,130,246,0.2)" }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        Connect GitHub & Start Free
      </button>

      <div className="mt-6 space-y-2">
        {["1 repo free forever", "No credit card required", "Risk scores in 5 minutes"].map(
          (text) => (
            <div key={text} className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="text-green-400">✓</span> {text}
            </div>
          )
        )}
      </div>

      <p className="text-center text-gray-500 text-xs mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-blue-400 hover:text-blue-300">
          Sign in
        </a>
      </p>
    </div>
  );
}