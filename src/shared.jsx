import { useState, useEffect } from 'react'

// ═══════════════════ CONSTANTS ════════════════════════════════════════════════
export const LOGO = "https://www.pizzatoscana.co.il/wp-content/uploads/2018/09/logo1.png"
export const ECATS = ["ירקות","מרינה","תנובה","גד","הכל לפיצה","חשמל","מים","שכירות","ארנונה"]
export const ICATS = ["אורט"]
export const DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"]
export const MN = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"]
export const INIT = [{
  id: 1,
  username: "Admin",
  password: "Abu88926",
  role: "admin",
  name: "מנהל ראשי",
  createdAt: new Date().toISOString()
}]

// ═══════════════════ THEME ════════════════════════════════════════════════════
export const T = {
  bg: "#0D0F18",
  card: "#161923",
  card2: "#1E2130",
  border: "rgba(255,255,255,0.07)",
  pr: "#E63946",
  gn: "#2ECC71",  gn2: "rgba(46,204,113,0.12)",
  rd: "#E74C3C",  rd2: "rgba(231,76,60,0.12)",
  or: "#F39C12",  or2: "rgba(243,156,18,0.12)",
  bl: "#3498DB",  bl2: "rgba(52,152,219,0.12)",
  pu: "#9B59B6",  pu2: "rgba(155,89,182,0.12)",
  tx: "#F0F2FF",  tx2: "#7A7F9A",  tx3: "#3D4160",
  sh: "0 2px 12px rgba(0,0,0,0.5)",
  shc: "0 4px 20px rgba(230,57,70,0.2)",
}

export const S = {
  field: {
    background: "#1E2130", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10, color: "#F0F2FF", outline: "none", fontFamily: "inherit",
    width: "100%", height: 46, display: "block", boxSizing: "border-box",
    padding: "0 14px", fontSize: 15, transition: "border .15s, box-shadow .15s",
  },
  btn: {
    background: "linear-gradient(135deg,#E63946,#C0392B)", border: "none",
    borderRadius: 10, padding: "0 20px", color: "#fff", fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit", height: 46,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, boxShadow: "0 4px 20px rgba(230,57,70,0.2)",
    transition: "opacity .15s, transform .1s",
  },
  btnSm: {
    background: "#1E2130", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 8, padding: "0 14px", color: "#7A7F9A", fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", height: 36,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: 13,
  },
}

// ═══════════════════ HELPERS ══════════════════════════════════════════════════
export function useLS(k, i) {
  const [v, sv] = useState(() => {
    try { const x = localStorage.getItem(k); return x ? JSON.parse(x) : i } catch { return i }
  })
  useEffect(() => {
    try { localStorage.setItem(k, JSON.stringify(v)) } catch {}
  }, [k, v])
  return [v, sv]
}

export const now    = () => new Date().toISOString()
export const money  = n => Number(n).toLocaleString("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 })
export const dtStr  = iso => iso ? new Date(iso).toLocaleString("he-IL") : ""
export const bizDay = () => new Date().toISOString().slice(0, 10)
export const dayNm  = ds => ds ? "יום " + DAYS[new Date(ds).getDay()] + " " + ds : ""
export const tooOld = (ds, role) => {
  if (role === "admin") return false
  const c = new Date(ds); c.setHours(0,0,0,0)
  const t = new Date(bizDay()); t.setHours(0,0,0,0)
  const y = new Date(t); y.setDate(t.getDate() - 1)
  return c < y
}
export const yesterday = () => {
  const d = new Date(); d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

// ═══════════════════ BASE UI COMPONENTS ═══════════════════════════════════════

export function Inp({ label, val, onChange, type = "text", onEnter, ph, disabled }) {
  const isDate = type === "date" || type === "month"
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 11, color: T.tx2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>
          {label}
        </label>
      )}
      <input
        value={val}
        type={type}
        placeholder={ph}
        disabled={disabled}
        onChange={ev => onChange(ev.target.value)}
        onKeyDown={ev => ev.key === "Enter" && onEnter?.()}
        style={{
          ...S.field,
          fontSize: isDate ? 11 : 15,
          padding: isDate ? "0 6px" : "0 14px",
          height: 46,
          overflow: "hidden",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "text",
          WebkitAppearance: isDate ? "none" : undefined,
        }}
        onFocus={ev => {
          ev.target.style.borderColor = T.pr
          ev.target.style.boxShadow = "0 0 0 3px rgba(230,57,70,0.15)"
        }}
        onBlur={ev => {
          ev.target.style.borderColor = T.border
          ev.target.style.boxShadow = "none"
        }}
      />
    </div>
  )
}

export function Sel({ label, val, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 11, color: T.tx2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>
          {label}
        </label>
      )}
      <select
        value={val}
        onChange={ev => onChange(ev.target.value)}
        style={{ ...S.field, appearance: "none" }}
      >
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )
}

export function Btn({ onClick, s, children, danger, ghost, type = "button" }) {
  const base = danger
    ? { ...S.btn, background: "linear-gradient(135deg,#C0392B,#922B21)" }
    : ghost ? S.btnSm : S.btn
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...base, ...s }}
      onMouseEnter={ev => { if (!ghost) ev.currentTarget.style.opacity = "0.88" }}
      onMouseLeave={ev => { if (!ghost) ev.currentTarget.style.opacity = "1" }}
    >
      {children}
    </button>
  )
}

export function G2({ children, gap = 12 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap, alignItems: "end" }}>
      {children}
    </div>
  )
}

export function Card({ title, children, action, p = 16, mb = 16, style: extraStyle }) {
  return (
    <div style={{ background: T.card, borderRadius: 16, border: "1px solid "+T.border, boxShadow: T.sh, marginBottom: mb, overflow: "hidden", ...extraStyle }}>
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid "+T.border }}>
          {title && <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.tx }}>{title}</h3>}
          {action}
        </div>
      )}
      <div style={{ padding: p }}>{children}</div>
    </div>
  )
}

export function Stat({ label, val, icon, color, bg, sub }) {
  return (
    <div style={{ background: T.card, borderRadius: 14, border: "1px solid "+T.border, boxShadow: T.sh, padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: T.tx2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: "-0.5px" }}>{val}</div>
          {sub && <div style={{ fontSize: 10, color: T.tx3, marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function IRow({ label, val, color, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: T.card2, borderRadius: 10, border: "1px solid "+T.border }}>
      <span style={{ fontSize: 13, color: T.tx2 }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 700, fontSize: bold ? 16 : 14, color: color || T.tx }}>{val}</span>
    </div>
  )
}

export function Tag({ children, color, bg }) {
  return (
    <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {children}
    </span>
  )
}

export function useToast() {
  const [t, st] = useState(null)
  const show = (m, ok = true) => { st({ m, ok }); setTimeout(() => st(null), 2800) }
  const Toast = t ? (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: t.ok ? "#162b1e" : "#2d1212",
      color: t.ok ? "#5ee89a" : "#ff7e7e",
      border: "1px solid " + (t.ok ? "rgba(46,204,113,0.4)" : "rgba(231,76,60,0.4)"),
      borderRadius: 12, padding: "10px 24px", fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)", zIndex: 9999, whiteSpace: "nowrap",
      animation: "fadeInUp 0.2s ease",
    }}>
      {t.m}
    </div>
  ) : null
  return { show, Toast }
}

export function Logo({ h = 36 }) {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: h, height: h, background: "linear-gradient(135deg,#E63946,#C0392B)", borderRadius: h*0.2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: h*0.5 }}>🍕</div>
        <div style={{ fontWeight: 900, fontSize: h*0.45, color: "#fff" }}>TOSCANA</div>
      </div>
    )
  }
  return (
    <img
      src={LOGO}
      alt="פיצה טוסקנה"
      height={h}
      style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
      onError={() => setErr(true)}
    />
  )
}

export function PageTitle({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.tx, letterSpacing: "-0.5px" }}>{title}</h1>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: T.tx2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function Empty({ text, icon = "📭" }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: T.tx3, fontSize: 13 }}>{text}</div>
    </div>
  )
}

export function MonthPicker({ value, onChange, style: extraStyle }) {
  return (
    <input
      type="month"
      value={value}
      onChange={ev => onChange(ev.target.value)}
      style={{ ...S.field, width: 130, height: 36, fontSize: 12, padding: "0 8px", ...extraStyle }}
    />
  )
}
