import { useState } from 'react'
import { T, S, Inp, Btn } from '../shared'

export function Auth({ users, onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [err,      setErr]      = useState("")
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const go = () => {
    const user = users.find(u => u.username === username && u.password === password)
    if (user) {
      setErr("")
      setLoading(true)
      setTimeout(() => onLogin(user, remember), 350)
    } else {
      setErr("שם משתמש או סיסמה שגויים")
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Heebo',sans-serif", direction: "rtl",
      padding: "20px", position: "relative", overflow: "hidden",
    }}>

      {/* Background glows */}
      <div style={{ position: "absolute", top: -160, right: -160, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -160, left: -160, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,159,10,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", left: "30%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(10,132,255,0.04) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative", animation: "scaleIn .3s ease" }}>

        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 76, height: 76, borderRadius: 24,
            background: "linear-gradient(135deg, #E63946 0%, #C0392B 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, margin: "0 auto 18px",
            boxShadow: "0 12px 40px rgba(230,57,70,0.45)",
          }}>
            🍕
          </div>
          <h1 style={{ color: T.tx, margin: "0 0 6px", fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}>
            פיצה טוסקנה
          </h1>
          <p style={{ color: T.tx2, margin: 0, fontSize: 13, fontWeight: 500 }}>
            מערכת ניהול עסקי
          </p>
        </div>

        {/* Login card */}
        <div style={{
          background: T.card,
          borderRadius: 24, padding: "36px 28px",
          border: "1px solid " + T.border,
          boxShadow: "0 28px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Inp
              label="שם משתמש"
              val={username}
              onChange={v => { setUsername(v); setErr("") }}
              onEnter={go}
              ph="הכנס שם משתמש"
              icon="👤"
            />
            <Inp
              label="סיסמה"
              val={password}
              onChange={v => { setPassword(v); setErr("") }}
              type="password"
              onEnter={go}
              ph="••••••••"
            />

            {/* Remember me */}
            <label style={{
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", fontSize: 13, color: T.tx2, userSelect: "none",
            }}>
              <div
                onClick={() => setRemember(v => !v)}
                style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: "2px solid " + (remember ? T.pr : T.tx3),
                  background: remember ? T.pr : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, cursor: "pointer", transition: "all .15s",
                  boxShadow: remember ? "0 0 0 3px rgba(230,57,70,0.2)" : "none",
                }}
              >
                {remember && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </div>
              זכור אותי
            </label>

            {err && (
              <div style={{
                color: T.rd, fontSize: 13,
                background: T.rd2, padding: "13px 16px",
                borderRadius: 12, border: "1px solid rgba(255,64,85,0.3)",
                display: "flex", alignItems: "center", gap: 10,
                animation: "scaleIn .2s ease",
              }}>
                <span>⚠️</span>
                {err}
              </div>
            )}

            <Btn onClick={go} s={{ width: "100%", height: 50, fontSize: 16, marginTop: 4 }}>
              {loading ? "מתחבר..." : "כניסה למערכת"}
            </Btn>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: T.tx3, marginTop: 22, fontWeight: 500 }}>
          אוסישקין 44, קרית מוצקין · 04-871-4222
        </p>
      </div>
    </div>
  )
}
