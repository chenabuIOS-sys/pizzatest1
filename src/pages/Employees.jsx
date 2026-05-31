import { useState } from 'react'
import { T, S, Card, Inp, G2, Btn, Tag, useToast, PageTitle, Empty, now, money, bizDay } from '../shared'

export function Employees({ emps, sEmps, hrs, cu, addLog }) {
  const [form, setForm]   = useState({ name: "", role: "", hourlyRate: "", startDate: bizDay() })
  const [showForm, setShowForm] = useState(false)
  const { show, Toast }   = useToast()

  function add() {
    if (!form.name) { show("הכנס שם", false); return }
    const emp = { id: Date.now(), ...form, hourlyRate: Number(form.hourlyRate) || 0, active: true, addedBy: cu.name, addedAt: now() }
    sEmps(p => [...p, emp])
    addLog("הוסף עובד", form.name, cu)
    show(form.name + " נוסף!")
    setForm({ name: "", role: "", hourlyRate: "", startDate: bizDay() })
    setShowForm(false)
  }

  function toggleActive(id) {
    const emp = emps.find(e => e.id === id)
    sEmps(p => p.map(e => e.id === id ? { ...e, active: !e.active } : e))
    addLog("שינוי סטטוס", emp?.name || "", cu)
  }

  const activeCount   = emps.filter(e => e.active).length
  const inactiveCount = emps.filter(e => !e.active).length

  return (
    <div>
      {Toast}
      <PageTitle
        title="עובדים"
        sub={`${activeCount} פעילים${inactiveCount > 0 ? " · " + inactiveCount + " לא פעילים" : ""}`}
        action={
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              ...S.btn, height: 38, fontSize: 13, padding: "0 16px",
              background: showForm ? T.card2 : "linear-gradient(135deg,#E63946,#C0392B)",
              border: showForm ? "1px solid " + T.border : "none",
              color: showForm ? T.tx2 : "#fff",
              boxShadow: showForm ? "none" : S.btn.boxShadow,
            }}
          >
            {showForm ? "✕ סגור" : "+ עובד חדש"}
          </button>
        }
      />

      {/* Add employee form */}
      {showForm && (
        <div style={{ marginBottom: 20, animation: "pageIn .2s ease" }}>
          <Card title="עובד חדש" accent={T.gn}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <G2>
                <Inp label="שם מלא"  val={form.name}       onChange={v => setForm(f => ({ ...f, name: v }))} />
                <Inp label="תפקיד"   val={form.role}       onChange={v => setForm(f => ({ ...f, role: v }))} />
              </G2>
              <G2>
                <Inp label="שכר שעתי ₪"    val={form.hourlyRate} onChange={v => setForm(f => ({ ...f, hourlyRate: v }))}  type="number" ph="0" />
                <Inp label="תאריך התחלה"   val={form.startDate}  onChange={v => setForm(f => ({ ...f, startDate: v }))}  type="date" />
              </G2>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn onClick={add} s={{ flex: 1 }}>הוסף עובד</Btn>
                <button onClick={() => setShowForm(false)} style={{ ...S.btnSm, flex: 1, justifyContent: "center", height: 48 }}>ביטול</button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Employee list */}
      {emps.length === 0 ? (
        <Card><Empty text="אין עובדים – הוסף עובד ראשון" icon="👥" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {emps.map(emp => {
            const totalHrs = hrs.filter(h => h.employeeId === emp.id).reduce((s, h) => s + Number(h.hours), 0)
            const totalSal = totalHrs * emp.hourlyRate
            return (
              <div
                key={emp.id}
                style={{
                  background: T.card, borderRadius: 16,
                  border: "1px solid " + T.border,
                  boxShadow: T.sh, padding: "16px 18px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  opacity: emp.active ? 1 : 0.52,
                  transition: "opacity .2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: emp.active
                      ? `linear-gradient(135deg,${T.pr},${T.or})`
                      : `linear-gradient(135deg,${T.tx3},${T.card3})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 800, color: "#fff",
                    boxShadow: emp.active ? "0 4px 14px rgba(230,57,70,0.3)" : "none",
                    transition: "all .2s",
                  }}>
                    {emp.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.tx, marginBottom: 2 }}>{emp.name}</div>
                    <div style={{ fontSize: 12, color: T.tx2 }}>
                      {emp.role && <span>{emp.role} · </span>}
                      <span style={{ color: T.bl }}>{money(emp.hourlyRate)}/שעה</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.or, marginTop: 2, fontWeight: 600 }}>
                      {totalHrs.toFixed(1)} שעות · {money(totalSal)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <Tag
                    color={emp.active ? T.gn : T.rd}
                    bg={emp.active ? T.gn2 : T.rd2}
                  >
                    {emp.active ? "● פעיל" : "○ לא פעיל"}
                  </Tag>
                  <button
                    onClick={() => toggleActive(emp.id)}
                    style={{
                      ...S.btnSm,
                      fontSize: 11,
                      color: emp.active ? T.rd : T.gn,
                      borderColor: emp.active ? "rgba(255,64,85,0.3)" : "rgba(0,200,120,0.3)",
                    }}
                  >
                    {emp.active ? "השבת" : "הפעל"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
