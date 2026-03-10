export default function DeployGuardPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">Deploy Guard</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-mono uppercase tracking-wider">
            Before Deploy
          </span>
        </div>
        <p className="text-gray-500 text-sm">
          Risk scores for every push to production
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm mb-2">No deploys yet</p>
        <p className="text-gray-600 text-xs">Connect a repo to start seeing risk scores</p>
      </div>
    </div>
  );
}