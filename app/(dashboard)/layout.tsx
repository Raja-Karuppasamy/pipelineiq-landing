"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Overview", href: "/overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Deploy Guard", href: "/deploy-guard", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
  { label: "Cost Tracker", href: "/cost-tracker", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Incidents", href: "/incidents", icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },
  { href: "/intelligence", label: "Intelligence", icon: "◆" },
];

const BOTTOM_ITEMS = [
  { label: "Repos", href: "/repos", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { label: "Alerts", href: "/alerts", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" },
  { label: "Settings", href: "/settings", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
    </svg>
  );
}

function NavLink({ item, isActive }: { item: { label: string; href: string; icon: string }; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "14px",
        textDecoration: "none",
        transition: "all 0.15s",
        background: isActive ? "rgba(59,130,246,0.1)" : "transparent",
        color: isActive ? "#60a5fa" : "rgba(255,255,255,0.45)",
      }}
      onMouseOver={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "white";
        }
      }}
      onMouseOut={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.45)";
        }
      }}
    >
      <NavIcon d={item.icon} />
      {item.label}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", background: "#030712", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{
        width: "240px",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        background: "#030712",
        zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "14px", color: "white" }}>
              Deploy<span style={{ color: "#3b82f6" }}>Guard</span>
            </span>
          </a>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <p style={{
            fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.25)", fontFamily: "monospace", padding: "0 12px", marginBottom: "8px",
          }}>Modules</p>

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}

          <div style={{ paddingTop: "16px" }}>
            <p style={{
              fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.25)", fontFamily: "monospace", padding: "0 12px", marginBottom: "8px",
            }}>Manage</p>

            {BOTTOM_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
              />
            ))}
          </div>
        </nav>

        {/* Plan badge */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{
            padding: "10px 12px", borderRadius: "8px",
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", fontFamily: "monospace", color: "rgba(255,255,255,0.4)" }}>Free Plan</span>
              <span style={{
                fontSize: "10px", padding: "1px 8px", borderRadius: "9999px",
                background: "rgba(59,130,246,0.1)", color: "#60a5fa", fontFamily: "monospace",
              }}>1/1 repo</span>
            </div>
            <a href="/settings/billing" style={{ fontSize: "12px", color: "#60a5fa", textDecoration: "none" }}>
              Upgrade →
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: "240px" }}>
        {/* Topbar */}
        <header style={{
          height: "56px", borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", position: "sticky", top: 0,
          background: "rgba(3,7,18,0.85)", backdropFilter: "blur(20px)", zIndex: 30,
        }}>
          <div />
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={async () => {
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              style={{
                padding: "6px 12px", borderRadius: "6px", fontSize: "12px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "monospace",
              }}
            >
              Logout
            </button>
            <div style={{
              width: "28px", height: "28px", borderRadius: "9999px",
              background: "linear-gradient(135deg, #34d399, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", fontWeight: 700, color: "white",
            }}>R</div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: "24px" }}>{children}</div>
      </main>
    </div>
  );
}
