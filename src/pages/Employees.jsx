import { useState } from 'react'
import { T, Card, Inp, G2, Btn, Tag, useToast, PageTitle, Empty, now, money, bizDay } from '../shared'

export function Employees({ emps, sEmps, hrs, cu, addLog }) {
  const [form, setForm] = useState({ name: "", role: "", hourlyRate: "", startDate: bizDay() })
  const { show, Toast } = useToast()

  function add() {
    if (!form.name) { show("הכנס שם", false); return }
    const emp = { id: Date.now(), ...form, hourlyRate: Number(form.hourlyRate) || 0, active: true, addedBy: cu.name, addedAt: now() }
    sEmps(p => [...p, emp])
    addLog("הוסף עובד", form.name, cu)
    show(form.name + " נוסף!")
    setForm({ name: "", role: "", hourlyRate: "", startDate: bizDay() })
  }

  function toggleActive(id) {
    const emp = emps.find(e => e.id === id)
    sEmps(p => p.map(e => e.id === id ? { ...e, active: !e.active } : e))
    addLog("שינוי סטטוס", emp?.name || "", cu)
  }

  return (
    <div>
      {Toast}
      <PageTitle title="עובדים" sub={emps.length + " עובדים רשומים"} />

      <Card title="עובד חדש">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <G2>
            <Inp label="שם מלא"  val={form.name}       onChange={v => setForm(f => ({ ...f, name: v }))} />
            <Inp label="תפקיד"   val={form.role}       onChange={v => setForm(f => ({ ...f, role: v }))} />
          </G2>
          <G2>
            <Inp label="שכר שעתי"      val={form.hourlyRate} onChange={v => setForm(f => ({ ...f, hourlyRate: v }))}  type="number" ph="0" />
            <Inp label="תאריך התחלה"   val={form.startDate}  onChange={v => setForm(f => ({ ...f, startDate: v }))}  type="date" />
          </G2>
          <Btn onClick={add} s={{ width: "100%" }}>הוסף עובד</Btn>
        </div>
      </Card>

      <div style={{ marginTop: 20 }}>
        {emps.length === 0 ? (
          <Card><Empty text="אין עובדים" icon="👥" /></Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {emps.map(emp => {
              const totalHrs = hrs.filter(h => h.employeeId === emp.id).reduce((s, h) => s + Number(h.hours), 0)
              return (
                <div key={emp.id} style={{ background: T.card, borderRadius: 14, border: "1px solid "+T.border, boxShadow: T.sh, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: emp.active ? 1 : 0.55 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${T.pr},${T.or})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff" }}>
                      {emp.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.tx }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: T.tx2, marginTop: 2 }}>{emp.role} · {money(emp.hourlyRate)}/שעה</div>
                      <div style={{ fontSize: 11, color: T.or, marginTop: 2 }}>{totalHrs.toFixed(1)} שעות · {money(totalHrs * emp.hourlyRate)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <Tag color={emp.active ? T.gn : T.rd} bg={emp.active ? T.gn2 : T.rd2}>
                      {emp.active ? "פעיל" : "לא פעיל"}
                    </Tag>
                    <button onClick={() => toggleActive(emp.id)} style={{ fontSize: 11, background: "none", border: "1px solid "+T.border, borderRadius: 8, padding: "4px 10px", color: T.tx2, cursor: "pointer", fontFamily: "inherit" }}>
                      {emp.active ? "השבת" : "הפעל"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
