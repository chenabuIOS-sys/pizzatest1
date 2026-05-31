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

const PAGES = {
  dash: Dash, daily: Daily, fin: Finance, hrs: Hours,
  emps: Employees, rep: MonthlyReport, log: AuditLog,
  usr: Users, myhours: MyHours
}

export default function App() {
  const [users,    sUsers]  = useLS("biz_u",  INIT)
  const [cu,       sCu]     = useState(null)
  const [txs,      sTxs]    = useLS("biz_tx", [])
  const [emps,     sEmps]   = useLS("biz_em", [])
  const [hrs,      sHrs]    = useLS("biz_hr", [])
  const [daily,    sDaily]  = useLS("biz_dy", [])
  const [lg,       sLg]     = useLS("biz_lg", [])
  const [tab,      sTab]    = useState("dash")
  const [saved,    sSaved]  = useLS("biz_sv", null)
  const [menuOpen, sMO]     = useState(false)

  const isAdmin  = cu?.role === "admin"
  const isWorker = cu?.role === "worker"

  useEffect(() => {
    if (!cu && saved) {
      const f = users.find(u => u.id === saved.id && u.password === saved.pw)
      if (f) sCu(f)
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (isWorker && tab !== "myhours") sTab("myhours")
  }, [isWorker]) // eslint-disable-line

  useEffect(() => {
    const h = ev => { if (ev.key === "Escape") sMO(false) }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
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
    { id: "daily", icon: "📅", label: "דוח יומי" },
    { id: "fin",   icon: "💳", label: "פיננסי" },
    { id: "hrs",   icon: "⏱", label: "שעות" },
  ]

  const menuNav = isWorker ? [] : [
    { id: "emps", icon: "👥", label: "עובדים" },
    ...(isAdmin ? [
      { id: "rep", icon: "📊", label: "דוח חודשי" },
      { id: "log", icon: "📋", label: "יומן פעולות" },
      { id: "usr", icon: "🔐", label: "משתמשים" },
    ] : []),
  ]

  const Page = PAGES[tab] || Dash
  const roleLabel = cu.role === "admin" ? "מנהל" : cu.role === "achmash" ? "אחמש" : "עובד"
  const roleColor = cu.role === "admin" ? T.pr : cu.role === "achmash" ? T.or : T.gn

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Heebo',sans-serif", direction: "rtl", color: T.tx }}>

      {/* ── TOP BAR ── */}
      <div className="no-print" style={{
        background: "rgba(13,16,24,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid " + T.border,
        padding: "0 16px",
        height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Logo h={27} />

        <button
          onClick={() => sMO(v => !v)}
          style={{
            background: menuOpen ? T.card2 : "none",
            border: "1px solid " + (menuOpen ? T.border2 : "transparent"),
            borderRadius: 12, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10,
            padding: "5px 8px 5px 10px",
            transition: "all .15s",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.tx, lineHeight: 1.3 }}>{cu.name}</div>
            <div style={{ fontSize: 10, color: roleColor, fontWeight: 700, letterSpacing: "0.3px" }}>{roleLabel}</div>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${roleColor}, ${T.or})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: "#fff",
            boxShadow: `0 2px 10px ${roleColor}55`,
          }}>
            {cu.name[0]}
          </div>
        </button>
      </div>

      {/* ── SLIDE MENU ── */}
      {menuOpen && (
        <div className="no-print" style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          <div
            onClick={() => sMO(false)}
            style={{ flex: 1, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          />
          <div style={{
            width: 285, background: T.card, height: "100%",
            display: "flex", flexDirection: "column",
            borderLeft: "1px solid " + T.border,
            boxShadow: "-16px 0 60px rgba(0,0,0,0.7)",
            animation: "slideInRight 0.22s cubic-bezier(0.22,0.61,0.36,1)",
          }}>

            {/* User header */}
            <div style={{
              padding: "22px 18px",
              background: `linear-gradient(135deg, rgba(230,57,70,0.07) 0%, transparent 100%)`,
              borderBottom: "1px solid " + T.border,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 15,
                  background: `linear-gradient(135deg, ${roleColor}, ${T.or})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 900, color: "#fff",
                  boxShadow: `0 4px 16px ${roleColor}44`,
                }}>
                  {cu.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.tx, marginBottom: 4 }}>{cu.name}</div>
                  <span style={{
                    fontSize: 10, color: roleColor, fontWeight: 700,
                    background: `${roleColor}18`, padding: "2px 9px",
                    borderRadius: 20, border: `1px solid ${roleColor}33`,
                    letterSpacing: "0.4px",
                  }}>
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Main nav */}
            <div style={{ padding: "14px 10px", borderBottom: menuNav.length > 0 ? "1px solid " + T.border : "none" }}>
              <div style={{ fontSize: 10, color: T.tx3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", padding: "0 8px 10px" }}>
                ניווט
              </div>
              {bottomNav.map(n => (
                <DrawerItem key={n.id} n={n} active={tab === n.id} onClick={() => { sTab(n.id); sMO(false) }} />
              ))}
            </div>

            {menuNav.length > 0 && (
              <div style={{ padding: "14px 10px", flex: 1 }}>
                <div style={{ fontSize: 10, color: T.tx3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", padding: "0 8px 10px" }}>
                  ניהול
                </div>
                {menuNav.map(n => (
                  <DrawerItem key={n.id} n={n} active={tab === n.id} onClick={() => { sTab(n.id); sMO(false) }} />
                ))}
              </div>
            )}

            {/* Logout */}
            <div style={{ padding: "14px 12px", borderTop: "1px solid " + T.border }}>
              <button
                onClick={() => { logout(); sMO(false) }}
                style={{
                  width: "100%", background: "rgba(255,64,85,0.07)",
                  border: "1px solid rgba(255,64,85,0.18)",
                  borderRadius: 12, padding: "12px 18px",
                  color: T.rd, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background .15s",
                }}
                onMouseEnter={ev => ev.currentTarget.style.background = "rgba(255,64,85,0.14)"}
                onMouseLeave={ev => ev.currentTarget.style.background = "rgba(255,64,85,0.07)"}
              >
                <span style={{ fontSize: 16 }}>↩</span>
                יציאה מהמערכת
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE CONTENT ── */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 14px 100px" }}>
        <div key={tab} style={{ animation: "pageIn .22s ease" }}>
          <Page {...pageProps} />
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div className="no-print" style={{
        position: "fixed", bottom: 0, right: 0, left: 0,
        background: "rgba(10,13,20,0.94)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid " + T.border,
        display: "flex", justifyContent: "space-around",
        padding: "6px 0 max(10px,env(safe-area-inset-bottom))",
        zIndex: 100,
      }}>
        {bottomNav.map(n => {
          const active = tab === n.id
          return (
            <button
              key={n.id}
              onClick={() => { sTab(n.id); sMO(false) }}
              style={{
                background: "none", border: "none",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                color: active ? T.pr : T.tx3,
                cursor: "pointer", fontFamily: "inherit",
                padding: "2px 8px", flex: 1,
              }}
            >
              <div style={{
                width: 48, height: 30, borderRadius: 10,
                background: active ? T.pr2 : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .2s",
                border: active ? "1px solid " + T.pr3 : "1px solid transparent",
              }}>
                <span style={{ fontSize: 19 }}>{n.icon}</span>
              </div>
              <span style={{ fontSize: 9.5, fontWeight: active ? 800 : 500, letterSpacing: "0.2px" }}>
                {n.label}
              </span>
            </button>
          )
        })}
        <button
          onClick={() => sMO(v => !v)}
          style={{
            background: "none", border: "none",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            color: menuOpen || menuNav.some(n => n.id === tab) ? T.pr : T.tx3,
            cursor: "pointer", fontFamily: "inherit",
            padding: "2px 8px", flex: 1,
          }}
        >
          <div style={{
            width: 48, height: 30, borderRadius: 10,
            background: (menuOpen || menuNav.some(n => n.id === tab)) ? T.pr2 : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .2s",
            border: (menuOpen || menuNav.some(n => n.id === tab)) ? "1px solid " + T.pr3 : "1px solid transparent",
          }}>
            <span style={{ fontSize: 19 }}>☰</span>
          </div>
          <span style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: "0.2px" }}>עוד</span>
        </button>
      </div>
    </div>
  )
}

function DrawerItem({ n, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 12px",
        background: active ? T.pr2 : "transparent",
        border: "none", borderRadius: 12,
        color: active ? T.pr : T.tx2,
        cursor: "pointer", fontFamily: "inherit",
        fontSize: 14, fontWeight: active ? 700 : 500,
        marginBottom: 2, textAlign: "right",
        transition: "background .1s, color .1s",
      }}
      onMouseEnter={ev => { if (!active) ev.currentTarget.style.background = T.card2 }}
      onMouseLeave={ev => { if (!active) ev.currentTarget.style.background = "transparent" }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: active ? T.pr3 : T.card2,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 17, flexShrink: 0,
        border: "1px solid " + T.border,
      }}>
        {n.icon}
      </div>
      {n.label}
    </button>
  )
}
