// app/(auth)/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm font-mono">
              P
            </div>
            <span className="font-mono font-bold text-lg text-white">
              PipelineIQ<span className="text-blue-500">Pro</span>
            </span>
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}