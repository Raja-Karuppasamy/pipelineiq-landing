export default function CostTrackerPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">Cost Tracker</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-mono uppercase tracking-wider">
            During Runs
          </span>
        </div>
        <p className="text-gray-500 text-sm">
          CI/CD spend visibility by repo, workflow, and team
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm mb-2">No cost data yet</p>
        <p className="text-gray-600 text-xs">Cost tracking begins once repos are connected</p>
      </div>
    </div>
  );
}