export default function IncidentsPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">Incidents</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-mono uppercase tracking-wider">
            After Failure
          </span>
        </div>
        <p className="text-gray-500 text-sm">
          Auto-generated failure timelines for postmortems
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm mb-2">No incidents recorded</p>
        <p className="text-gray-600 text-xs">Incident timelines are generated automatically when deploys fail</p>
      </div>
    </div>
  );
}