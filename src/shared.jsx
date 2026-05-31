import { useState, useEffect } from 'react'

// ═══════════════════ CONSTANTS ════════════════════════════════════════════════
export const LOGO = "https://www.pizzatoscana.co.il/wp-content/uploads/2018/09/logo1.png"
export const ECATS = ["ירקות","מרינה","תנובה","גד","הכל לפיצה","חשמל","מים","שכירות","ארנונה"]
export const ICATS = ["אורט"]
export const DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"]
export const MN = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"]
export const INIT = [{
  id: 1, username: "Admin", password: "Abu88926",
  role: "admin", name: "מנהל ראשי", createdAt: new Date().toISOString()
}]

// ═══════════════════ THEME ════════════════════════════════════════════════════
export const T = {
  bg:      "#07090F",
  card:    "#0D1018",
  card2:   "#141929",
  card3:   "#1B2236",
  border:  "rgba(255,255,255,0.07)",
  border2: "rgba(255,255,255,0.14)",

  pr:  "#E63946",  pr2: "rgba(230,57,70,0.12)",  pr3: "rgba(230,57,70,0.22)",
  gn:  "#00C878",  gn2: "rgba(0,200,120,0.10)",  gn3: "rgba(0,200,120,0.20)",
  rd:  "#FF4055",  rd2: "rgba(255,64,85,0.10)",   rd3: "rgba(255,64,85,0.22)",
  or:  "#FF9F0A",  or2: "rgba(255,159,10,0.10)",  or3: "rgba(255,159,10,0.20)",
  bl:  "#0A84FF",  bl2: "rgba(10,132,255,0.10)",  bl3: "rgba(10,132,255,0.20)",
  pu:  "#BF5AF2",  pu2: "rgba(191,90,242,0.10)",  pu3: "rgba(191,90,242,0.20)",

  tx:  "#F2F4FF",
  tx2: "#8894A8",
  tx3: "#3A4160",

  sh:   "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
  shc:  "0 6px 24px rgba(230,57,70,0.35)",
  shPr: "0 6px 24px rgba(230,57,70,0.35)",
  shGn: "0 6px 24px rgba(0,200,120,0.25)",
}

// ═══════════════════ BASE STYLES ══════════════════════════════════════════════
export const S = {
  field: {
    background: "#141929",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    color: "#F2F4FF",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    height: 48,
    display: "block",
    boxSizing: "border-box",
    padding: "0 16px",
    fontSize: 15,
    transition: "border-color .15s, box-shadow .15s",
  },
  btn: {
    background: "linear-gradient(135deg, #E63946 0%, #C0392B 100%)",
    border: "none",
    borderRadius: 12,
    padding: "0 24px",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    height: 48,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    boxShadow: "0 4px 20px rgba(230,57,70,0.35)",
    transition: "opacity .15s, transform .1s",
    letterSpacing: "0.2px",
    WebkitTapHighlightColor: "transparent",
  },
  btnSm: {
    background: "#141929",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "0 14px",
    color: "#8894A8",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    height: 36,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    transition: "background .1s, color .1s",
    WebkitTapHighlightColor: "transparent",
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

export const now      = () => new Date().toISOString()
export const money    = n => Number(n).toLocaleString("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 })
export const dtStr    = iso => iso ? new Date(iso).toLocaleString("he-IL") : ""
export const bizDay   = () => new Date().toISOString().slice(0, 10)
export const dayNm    = ds => ds ? "יום " + DAYS[new Date(ds).getDay()] + " " + ds : ""
export const tooOld   = (ds, role) => {
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

// ═══════════════════ COMPONENTS ═══════════════════════════════════════════════

export function Inp({ label, val, onChange, type = "text", onEnter, ph, disabled, icon }) {
  const isDate = type === "date" || type === "month"
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {label && (
        <label style={{ fontSize: 11, color: T.tx2, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.9px" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: T.tx3, fontSize: 16, pointerEvents: "none" }}>
            {icon}
          </span>
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
            height: isDate ? 44 : 48,
            fontSize: isDate ? 13 : 15,
            padding: isDate ? "0 10px" : icon ? "0 44px 0 16px" : "0 16px",
            opacity: disabled ? 0.45 : 1,
            cursor: disabled ? "not-allowed" : "text",
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
    </div>
  )
}

export function Sel({ label, val, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {label && (
        <label style={{ fontSize: 11, color: T.tx2, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.9px" }}>
          {label}
        </label>
      )}
      <select
        value={val}
        onChange={ev => onChange(ev.target.value)}
        style={{
          ...S.field,
          appearance: "none",
          cursor: "pointer",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238894A8' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left 14px center",
          paddingLeft: 36,
        }}
        onFocus={ev => {
          ev.target.style.borderColor = T.pr
          ev.target.style.boxShadow = "0 0 0 3px rgba(230,57,70,0.15)"
        }}
        onBlur={ev => {
          ev.target.style.borderColor = T.border
          ev.target.style.boxShadow = "none"
        }}
      >
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )
}

export function Btn({ onClick, s, children, danger, ghost, success, type = "button" }) {
  const base = danger
    ? { ...S.btn, background: "linear-gradient(135deg,#FF4055,#C0392B)", boxShadow: "0 4px 20px rgba(255,64,85,0.3)" }
    : success
    ? { ...S.btn, background: "linear-gradient(135deg,#00C878,#00A060)", boxShadow: "0 4px 20px rgba(0,200,120,0.3)" }
    : ghost ? S.btnSm
    : S.btn

  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...base, ...s }}
      onMouseEnter={ev => { if (!ghost) ev.currentTarget.style.opacity = "0.86" }}
      onMouseLeave={ev => { if (!ghost) ev.currentTarget.style.opacity = "1" }}
      onMouseDown={ev => { ev.currentTarget.style.transform = "scale(0.97)" }}
      onMouseUp={ev => { ev.currentTarget.style.transform = "scale(1)" }}
      onTouchStart={ev => { ev.currentTarget.style.transform = "scale(0.97)" }}
      onTouchEnd={ev => { ev.currentTarget.style.transform = "scale(1)" }}
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

export function Card({ title, children, action, p = 18, mb = 14, style: extraStyle, accent }) {
  return (
    <div style={{
      background: T.card,
      borderRadius: 18,
      border: "1px solid " + T.border,
      boxShadow: T.sh,
      marginBottom: mb,
      overflow: "hidden",
      ...(accent ? { borderTop: `2px solid ${accent}` } : {}),
      ...extraStyle,
    }}>
      {(title || action) && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 18px",
          borderBottom: "1px solid " + T.border,
        }}>
          {title && <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.tx, letterSpacing: "0.3px", textTransform: "uppercase" }}>{title}</h3>}
          {action}
        </div>
      )}
      <div style={{ padding: p }}>{children}</div>
    </div>
  )
}

export function Stat({ label, val, icon, color, bg, sub }) {
  return (
    <div style={{
      background: T.card,
      borderRadius: 16,
      border: "1px solid " + T.border,
      boxShadow: T.sh,
      padding: "18px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -20, left: -20,
        width: 90, height: 90, borderRadius: "50%",
        background: bg || "transparent",
        filter: "blur(28px)",
        opacity: 0.9,
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: T.tx2, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 10 }}>
            {label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: color || T.tx, letterSpacing: "-0.5px", lineHeight: 1 }}>
            {val}
          </div>
          {sub && <div style={{ fontSize: 10, color: T.tx2, marginTop: 7, fontWeight: 500 }}>{sub}</div>}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: bg || T.card2,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
          border: "1px solid " + T.border,
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function IRow({ label, val, color, bold }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "13px 16px",
      background: T.card2,
      borderRadius: 12,
      border: "1px solid " + T.border,
    }}>
      <span style={{ fontSize: 13, color: T.tx2 }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 700, fontSize: bold ? 17 : 14, color: color || T.tx }}>
        {val}
      </span>
    </div>
  )
}

export function Tag({ children, color, bg }) {
  return (
    <span style={{
      background: bg, color,
      fontSize: 10, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20,
      whiteSpace: "nowrap", letterSpacing: "0.3px",
    }}>
      {children}
    </span>
  )
}

export function useToast() {
  const [t, st] = useState(null)
  const show = (m, ok = true) => { st({ m, ok }); setTimeout(() => st(null), 2800) }
  const Toast = t ? (
    <div style={{
      position: "fixed", bottom: 90, left: "50%",
      transform: "translateX(-50%)",
      background: t.ok ? "#0D2218" : "#1E0D0D",
      color: t.ok ? "#00C878" : "#FF4055",
      border: "1px solid " + (t.ok ? "rgba(0,200,120,0.35)" : "rgba(255,64,85,0.35)"),
      borderRadius: 14, padding: "12px 28px",
      fontSize: 14, fontWeight: 700,
      boxShadow: t.ok ? "0 8px 32px rgba(0,200,120,0.2)" : "0 8px 32px rgba(255,64,85,0.2)",
      zIndex: 9999, whiteSpace: "nowrap",
      animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
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
        <div style={{ width: h, height: h, background: "linear-gradient(135deg,#E63946,#C0392B)", borderRadius: Math.round(h * 0.22), display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(h * 0.52) }}>🍕</div>
        <div style={{ fontWeight: 900, fontSize: Math.round(h * 0.46), color: "#fff", letterSpacing: "-0.5px" }}>TOSCANA</div>
      </div>
    )
  }
  return (
    <img
      src={LOGO} alt="פיצה טוסקנה" height={h}
      style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
      onError={() => setErr(true)}
    />
  )
}

export function PageTitle({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: T.tx, letterSpacing: "-0.5px" }}>{title}</h1>
        {sub && <p style={{ margin: "5px 0 0", fontSize: 12, color: T.tx2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function Empty({ text, icon = "📭" }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 44, marginBottom: 12, opacity: 0.5 }}>{icon}</div>
      <div style={{ color: T.tx3, fontSize: 13, fontWeight: 500 }}>{text}</div>
    </div>
  )
}

export function MonthPicker({ value, onChange, style: extraStyle }) {
  return (
    <input
      type="month"
      value={value}
      onChange={ev => onChange(ev.target.value)}
      style={{ ...S.field, width: 130, height: 36, fontSize: 12, padding: "0 10px", ...extraStyle }}
    />
  )
}

export function SegTabs({ options, value, onChange }) {
  return (
    <div style={{
      display: "flex",
      background: T.card2,
      borderRadius: 12,
      padding: 4,
      gap: 2,
      border: "1px solid " + T.border,
    }}>
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{
            flex: 1, border: "none", borderRadius: 9,
            padding: "9px 8px",
            background: value === o.id ? T.pr : "transparent",
            color: value === o.id ? "#fff" : T.tx2,
            fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer",
            transition: "background .15s, color .15s",
            boxShadow: value === o.id ? "0 2px 8px rgba(230,57,70,0.3)" : "none",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function InfoBanner({ ok, icon, title, sub }) {
  const color = ok ? T.gn : T.or
  const bg = ok
    ? "linear-gradient(135deg, rgba(0,200,120,0.10), rgba(0,200,120,0.04))"
    : "linear-gradient(135deg, rgba(255,159,10,0.10), rgba(255,159,10,0.04))"
  const border = ok ? "rgba(0,200,120,0.25)" : "rgba(255,159,10,0.25)"
  return (
    <div style={{
      background: bg,
      border: "1px solid " + border,
      borderRadius: 16,
      padding: "16px 18px",
      marginBottom: 18,
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: ok ? T.gn3 : T.or3,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.tx }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: color, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}
