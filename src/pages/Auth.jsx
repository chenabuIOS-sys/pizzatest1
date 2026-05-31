import { useState } from 'react'
import { T, S, Logo, Inp, Btn } from '../shared'

export function Auth({ users, onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [err,      setErr]      = useState("")
  const [remember, setRemember] = useState(false)

  const go = () => {
    const user = users.find(u => u.username === username && u.password === password)
    if (user) onLogin(user, remember)
    else setErr("שם משתמש או סיסמה שגויים")
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Heebo',sans-serif", direction: "rtl", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ background: T.card, borderRadius: 20, padding: 36, border: "1px solid "+T.border, boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Logo h={44} />
            <h2 style={{ color: T.tx, margin: "16px 0 4px", fontSize: 22, fontWeight: 800 }}>פיצה טוסקנה</h2>
            <p style={{ color: T.tx2, margin: 0, fontSize: 13 }}>מערכת ניהול עסקי</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Inp label="שם משתמש" val={username} onChange={setUsername} onEnter={go} />
            <Inp label="סיסמה" val={password} onChange={setPassword} type="password" onEnter={go} />

            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: T.tx2, userSelect: "none" }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={ev => setRemember(ev.target.checked)}
                style={{ width: 18, height: 18, accentColor: T.pr, cursor: "pointer" }}
              />
              זכור אותי
            </label>

            {err && (
              <div style={{ color: T.rd, fontSize: 12, background: T.rd2, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(231,76,60,0.3)" }}>
                {err}
              </div>
            )}

            <Btn onClick={go} s={{ width: "100%" }}>כניסה למערכת</Btn>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: T.tx3, marginTop: 24, marginBottom: 0 }}>
            אוסישקין 44, קרית מוצקין | 04-871-4222
          </p>
        </div>
      </div>
    </div>
  )
}
