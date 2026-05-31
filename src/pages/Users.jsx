import { useState } from 'react'
import { T, S, Card, Inp, Sel, G2, Btn, Tag, useToast, Empty, now } from '../shared'

const ROLES = [
  { v: "admin",   l: "Admin – גישה מלאה" },
  { v: "achmash", l: "אחמש – ניהול שוטף" },
  { v: "worker",  l: "עובד – שעות בלבד" },
]

const roleColor = r => r === "admin" ? T.pr : r === "achmash" ? T.or : T.gn
const roleLabel = r => r === "admin" ? "Admin" : r === "achmash" ? "אחמש" : "עובד"

export function Users({ users, sUsers, cu, emps, sEmps, addLog }) {
  const [view, setView]           = useState("list")
  const [form, setForm]           = useState({ username: "", password: "", name: "", role: "achmash" })
  const [editId, setEditId]       = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [showPw, setShowPw]       = useState({})
  const [confirmDel, setConfirmDel] = useState(null)
  const [linkUser, setLinkUser]   = useState("")
  const [linkEmp, setLinkEmp]     = useState("")
  const { show, Toast } = useToast()

  function addUser() {
    if (!form.username || !form.password || !form.name) { show("מלא את כל השדות", false); return }
    if (users.find(u => u.username === form.username))  { show("שם המשתמש תפוס", false); return }
    const u = { id: Date.now(), ...form, createdAt: now() }
    sUsers(p => [...p, u])
    addLog("יצירת משתמש", form.name, cu)
    show(form.name + " נוסף!")
    setForm({ username: "", password: "", name: "", role: "achmash" })
    setView("list")
  }

  function removeUser(id) {
    const u = users.find(x => x.id === id)
    sEmps(p => p.map(e => e.linkedUserId === id ? { ...e, linkedUserId: null } : e))
    sUsers(p => p.filter(x => x.id !== id))
    addLog("מחיקת משתמש", u?.name || "", cu)
    show("הוסר!")
    setConfirmDel(null)
  }

  function saveEdit() {
    if (!editForm.username || !editForm.password || !editForm.name) { show("מלא את כל השדות", false); return }
    if (users.find(u => u.username === editForm.username && u.id !== editId)) { show("שם המשתמש תפוס", false); return }
    sUsers(p => p.map(u => u.id === editId ? { ...u, ...editForm } : u))
    addLog("עדכון משתמש", editForm.name, cu)
    show("עודכן!")
    setEditId(null)
  }

  function link() {
    if (!linkUser || !linkEmp) { show("בחר משתמש ועובד", false); return }
    const lid  = Number(linkUser)
    const eid  = Number(linkEmp)
    sEmps(p => p.map(e => {
      if (e.id === eid)           return { ...e, linkedUserId: lid }
      if (e.linkedUserId === lid) return { ...e, linkedUserId: null }
      return e
    }))
    const uName = users.find(x => x.id === lid)?.name || ""
    const eName = emps.find(x => x.id === eid)?.name  || ""
    addLog("קישור", uName + " >> " + eName, cu)
    show(uName + " קושר ל" + eName + "!")
    setLinkUser(""); setLinkEmp("")
  }

  const workerUsers   = users.filter(u => u.role === "worker")
  const linkedEmpIds  = emps.filter(e => e.linkedUserId).map(e => e.linkedUserId)

  return (
    <div>
      {Toast}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.tx }}>משתמשים</h1>
        <div style={{ display: "flex", background: T.card, borderRadius: 10, padding: 3, gap: 3, border: "1px solid "+T.border }}>
          {[{ id: "list", l: "רשימה" }, { id: "add", l: "הוסף" }, { id: "link", l: "קישור" }].map(o => (
            <button
              key={o.id}
              onClick={() => setView(o.id)}
              style={{ border: "none", borderRadius: 8, padding: "7px 12px", background: view === o.id ? T.pr : "transparent", color: view === o.id ? "#fff" : T.tx2, fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* ─── User list ─── */}
      {view === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map(u => {
            const linked    = emps.find(e => e.linkedUserId === u.id)
            const isEditing = editId === u.id
            return (
              <div key={u.id} style={{ background: T.card, borderRadius: 14, border: "1px solid "+(isEditing ? T.pr : T.border), boxShadow: T.sh, overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${roleColor(u.role)},${T.or})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff" }}>
                      {u.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.tx }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: T.tx2 }}>@{u.username} · {roleLabel(u.role)}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <span style={{ fontSize: 10, color: T.tx3 }}>סיסמה:</span>
                        <span style={{ fontSize: 11, color: T.tx2, fontFamily: "monospace" }}>{showPw[u.id] ? u.password : "••••••"}</span>
                        <button
                          onClick={() => setShowPw(p => ({ ...p, [u.id]: !p[u.id] }))}
                          style={{ background: "none", border: "none", color: T.tx3, cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}
                        >
                          {showPw[u.id] ? "🙈" : "👁"}
                        </button>
                      </div>
                      {linked && <div style={{ fontSize: 11, color: T.gn, marginTop: 3 }}>🔗 {linked.name}</div>}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => { if (isEditing) { setEditId(null) } else { setEditId(u.id); setEditForm({ username: u.username, password: u.password, name: u.name, role: u.role }) } }}
                      style={{ ...S.btnSm, color: isEditing ? T.pr : T.tx2, borderColor: isEditing ? T.pr : T.border }}
                    >
                      {isEditing ? "✕" : "✏️"}
                    </button>
                    {u.id !== 1 && (
                      confirmDel === u.id ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button onClick={() => removeUser(u.id)} style={{ ...S.btn, height: 34, padding: "0 12px", fontSize: 12 }}>מחק</button>
                          <button onClick={() => setConfirmDel(null)} style={S.btnSm}>לא</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDel(u.id)} style={{ ...S.btnSm, color: T.rd, borderColor: "rgba(231,76,60,0.4)" }}>🗑️</button>
                      )
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div style={{ background: T.card2, borderTop: "1px solid "+T.border, padding: "14px 16px" }}>
                    <G2>
                      <Inp label="שם מלא"     val={editForm.name}     onChange={v => setEditForm(f => ({ ...f, name: v }))} />
                      <Inp label="שם משתמש"   val={editForm.username} onChange={v => setEditForm(f => ({ ...f, username: v }))} />
                      <Inp label="סיסמה"       val={editForm.password} onChange={v => setEditForm(f => ({ ...f, password: v }))} type="password" />
                      <Sel label="תפקיד"       val={editForm.role}     onChange={v => setEditForm(f => ({ ...f, role: v }))} options={ROLES} />
                    </G2>
                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <Btn onClick={saveEdit} s={{ flex: 1, height: 40, fontSize: 13 }}>שמור</Btn>
                      <button onClick={() => setEditId(null)} style={{ ...S.btnSm, flex: 1, height: 40, justifyContent: "center" }}>ביטול</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Add user ─── */}
      {view === "add" && (
        <Card title="משתמש חדש">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <G2>
              <Inp label="שם מלא"   val={form.name}     onChange={v => setForm(f => ({ ...f, name: v }))} />
              <Inp label="שם משתמש" val={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} />
            </G2>
            <G2>
              <Inp label="סיסמה"   val={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} type="password" />
              <Sel label="תפקיד"   val={form.role}     onChange={v => setForm(f => ({ ...f, role: v }))} options={ROLES} />
            </G2>
            <div style={{ fontSize: 12, color: T.tx2, background: T.card2, padding: "10px 14px", borderRadius: 10, border: "1px solid "+T.border }}>
              {form.role === "admin" ? "Admin: גישה מלאה לכל המערכת" : form.role === "achmash" ? "אחמש: גישה לדוח יומי, פיננסי, עובדים ושעות" : "עובד: רואה רק את שעות העבודה שלו"}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={addUser} s={{ flex: 1 }}>הוסף</Btn>
              <button onClick={() => setView("list")} style={{ ...S.btnSm, flex: 1, height: 46, justifyContent: "center" }}>ביטול</button>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Link worker to employee ─── */}
      {view === "link" && (
        <Card title="קישור עובד למשתמש">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: T.tx2 }}>קשר משתמש עובד לרשומת עובד כדי שיראה את שעותיו.</p>
            <G2>
              <Sel
                label="משתמש עובד"
                val={linkUser}
                onChange={setLinkUser}
                options={[{ v: "", l: "בחר משתמש..." }, ...workerUsers.map(u => ({ v: String(u.id), l: u.name + " (@" + u.username + ")" }))]}
              />
              <Sel
                label="עובד ברשימה"
                val={linkEmp}
                onChange={setLinkEmp}
                options={[{ v: "", l: "בחר עובד..." }, ...emps.map(e2 => {
                  const linked = users.find(u => u.id === e2.linkedUserId)
                  return { v: String(e2.id), l: e2.name + (linked ? " (מקושר ל" + linked.name + ")" : "") }
                })]}
              />
            </G2>
            <Btn onClick={link} s={{ width: "100%" }}>קשר</Btn>

            {/* Existing links */}
            {emps.filter(e => e.linkedUserId).length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: T.tx2, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>קישורים קיימים</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {emps.filter(e => e.linkedUserId).map(e2 => {
                    const u = users.find(x => x.id === e2.linkedUserId)
                    return (
                      <div key={e2.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: T.card2, borderRadius: 10, border: "1px solid "+T.border }}>
                        <span style={{ fontSize: 13, color: T.tx }}>{(u?.name || "?")} → {e2.name}</span>
                        <button
                          onClick={() => { sEmps(p => p.map(x => x.id === e2.id ? { ...x, linkedUserId: null } : x)); show("קישור בוטל!") }}
                          style={{ ...S.btnSm, color: T.rd, borderColor: "rgba(231,76,60,0.4)", fontSize: 11 }}
                        >
                          בטל
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
