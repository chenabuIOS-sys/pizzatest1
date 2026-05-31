import { useState, useEffect } from 'react'
import { useLS, now, Logo, T, S, INIT } from './shared'
import { Dash }          from './pages/Dash'
import { Daily }         from './pages/Daily'
import { Finance }       from './pages/Finance'
import { Hours }         from './pages/Hours'
import { MyHours }       from './pages/MyHours'
import { Employees }     from './pages/Employees'
import { MonthlyReport } from './pages/MonthlyReport'
import { AuditLog }      from './pages/AuditLog'
import { Users }         from './pages/Users'
import { Auth }          from './pages/Auth'

const PAGES = { dash: Dash, daily: Daily, fin: Finance, hrs: Hours, emps: Employees, rep: MonthlyReport, log: AuditLog, usr: Users, myhours: MyHours }

export default function App() {
  const [users,  sUsers]  = useLS("biz_u",  INIT)
  const [cu,     sCu]     = useState(null)
  const [txs,    sTxs]    = useLS("biz_tx", [])
  const [emps,   sEmps]   = useLS("biz_em", [])
  const [hrs,    sHrs]    = useLS("biz_hr", [])
  const [daily,  sDaily]  = useLS("biz_dy", [])
  const [lg,     sLg]     = useLS("biz_lg", [])
  const [tab,    sTab]    = useState("dash")
  const [saved,  sSaved]  = useLS("biz_sv", null)
  const [menuOpen, sMO]   = useState(false)

  const isAdmin  = cu?.role === "admin"
  const isWorker = cu?.role === "worker"

  // Restore session
  useEffect(() => {
    if (!cu && saved) {
      const f = users.find(u => u.id === saved.id && u.password === saved.pw)
      if (f) sCu(f)
    }
  }, []) // eslint-disable-line

  // Workers only see their hours
  useEffect(() => {
    if (isWorker && tab !== "myhours") sTab("myhours")
  }, [isWorker]) // eslint-disable-line

  // Close menu with Escape key
  useEffect(() => {
    const handler = ev => { if (ev.key === "Escape") sMO(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const login  = (u, rem) => { sCu(u); sTab("dash"); rem ? sSaved({ id: u.id, pw: u.password }) : sSaved(null) }
  const logout = () => { sCu(null); sSaved(null); sTab("dash") }
  const addLog = (a, d, u) => sLg(p => [{ id: Date.now(), user: u?.name || "?", action: a, details: d, at: now() }, ...p].slice(0, 500))

  if (!cu) return <Auth users={users} onLogin={login} />

  const pageProps = { cu, users, sUsers, txs, sTxs, emps, sEmps, hrs, sHrs, daily, sDaily, lg, addLog }

  const bottomNav = isWorker ? [
    { id: "myhours", icon: "⏱", label: "שעות" },
  ] : [
    { id: "dash",  icon: "🏠", label: "ראשי" },
    { id: "daily", icon: "📅", label: "דוח" },
    { id: "fin",   icon: "💳", label: "פיננסי" },
    { id: "hrs",   icon: "⏱", label: "שעות" },
  ]

  const menuNav = isWorker ? [] : [
    { id: "emps", icon: "👥", label: "עובדים" },
    ...(isAdmin ? [
      { id: "rep", icon: "📊", label: "דוח חודשי" },
      { id: "log", icon: "📋", label: "יומן" },
      { id: "usr", icon: "🔐", label: "משתמשים" },
    ] : []),
  ]

  const Page = PAGES[tab] || Dash

  const roleLabel = cu.role === "admin" ? "Admin" : cu.role === "achmash" ? "אחמש" : "עובד"

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Heebo',sans-serif", direction: "rtl", color: T.tx }}>

      {/* ── TOP BAR ── */}
      <div className="no-print" style={{ background: T.card, borderBottom: "1px solid "+T.border, padding: "0 16px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
        <Logo h={30} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${T.pr},${T.or})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>
            {cu.name[0]}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.tx }}>{cu.name}</div>
            <div style={{ fontSize: 10, color: T.tx2 }}>{roleLabel}</div>
          </div>
        </div>
      </div>

      {/* ── SLIDE MENU ── */}
      {menuOpen && (
        <div className="no-print" style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          {/* Overlay */}
          <div onClick={() => sMO(false)} style={{ flex: 1, background: "rgba(0,0,0,0.7)" }} />
          {/* Drawer */}
          <div style={{ width: 270, background: T.card, height: "100%", display: "flex", flexDirection: "column", borderLeft: "1px solid "+T.border, boxShadow: "-8px 0 40px rgba(0,0,0,0.5)", animation: "slideInRight 0.2s ease" }}>
            {/* User header */}
            <div style={{ padding: "20px 18px", borderBottom: "1px solid "+T.border }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${T.pr},${T.or})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>
                  {cu.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.tx }}>{cu.name}</div>
                  <div style={{ fontSize: 11, color: T.tx2 }}>{roleLabel}</div>
                </div>
              </div>
            </div>

            {/* Nav list */}
            <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
              {[...bottomNav, ...menuNav].map(n => (
                <button
                  key={n.id}
                  onClick={() => { sTab(n.id); sMO(false) }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 14,
                    padding: "13px 16px", background: tab === n.id ? "rgba(230,57,70,0.12)" : "transparent",
                    border: "none", borderRight: tab === n.id ? "3px solid "+T.pr : "3px solid transparent",
                    borderRadius: 12, color: tab === n.id ? T.pr : T.tx2, cursor: "pointer",
                    fontFamily: "inherit", fontSize: 14, fontWeight: tab === n.id ? 700 : 500,
                    marginBottom: 3, textAlign: "right", transition: "all .1s",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{n.icon}</span>
                  {n.label}
                </button>
              ))}
            </div>

            {/* Logout */}
            <div style={{ padding: 16, borderTop: "1px solid "+T.border }}>
              <button
                onClick={() => { logout(); sMO(false) }}
                style={{ ...S.btnSm, width: "100%", height: 42, fontSize: 13, justifyContent: "center" }}
              >
                יציאה מהמערכת
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE CONTENT ── */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 14px 96px" }}>
        <Page {...pageProps} />
      </div>

      {/* ── BOTTOM NAV ── */}
      <div className="no-print" style={{ position: "fixed", bottom: 0, right: 0, left: 0, background: T.card, borderTop: "1px solid "+T.border, display: "flex", justifyContent: "space-around", padding: "6px 0 max(8px,env(safe-area-inset-bottom))", zIndex: 100, boxShadow: "0 -2px 12px rgba(0,0,0,0.4)" }}>
        {bottomNav.map(n => (
          <button
            key={n.id}
            onClick={() => { sTab(n.id); sMO(false) }}
            style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: tab === n.id ? T.pr : T.tx3, cursor: "pointer", fontFamily: "inherit", padding: "4px 10px", flex: 1, transition: "color .15s" }}
          >
            <span style={{ fontSize: 24 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: tab === n.id ? 700 : 400, letterSpacing: "0.3px" }}>{n.label}</span>
            {tab === n.id && <div style={{ width: 20, height: 2, background: T.pr, borderRadius: 2, marginTop: 2 }} />}
          </button>
        ))}
        <button
          onClick={() => sMO(v => !v)}
          style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: menuOpen || menuNav.some(n => n.id === tab) ? T.pr : T.tx3, cursor: "pointer", fontFamily: "inherit", padding: "4px 10px", flex: 1 }}
        >
          <span style={{ fontSize: 24 }}>☰</span>
          <span style={{ fontSize: 9, letterSpacing: "0.3px" }}>עוד</span>
          {menuNav.some(n => n.id === tab) && <div style={{ width: 20, height: 2, background: T.pr, borderRadius: 2, marginTop: 2 }} />}
        </button>
      </div>
    </div>
  )
}
