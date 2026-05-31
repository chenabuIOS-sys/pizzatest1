import { useState } from 'react'
import { T, S, Card, Inp, G2, Btn, useToast, PageTitle, Empty, useLS, now, money, bizDay, dayNm, tooOld, yesterday } from '../shared'

export function Daily({ daily, sDaily, txs, sTxs, cu, addLog }) {
  const [lockedMonths] = useLS("biz_locked", [])
  const [form, setForm] = useState({ date: bizDay(), diners: "", cash: "", credit: "", note: "" })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ diners: "", cash: "", credit: "", note: "" })
  const { show, Toast } = useToast()

  const existingReport = daily.find(r => r.date === form.date)
  const formTotal = (Number(form.cash) || 0) + (Number(form.credit) || 0)

  function makeIncomeEntries(report, date, addedBy) {
    const entries = [], ts = Date.now()
    if (report.cash   > 0) entries.push({ id: ts+1, type:"income", category:"דוח יומי", amount: report.cash,   date, description:"מזומן", addedBy, addedAt: now(), fromDaily:true, dailyDate:date })
    if (report.credit > 0) entries.push({ id: ts+2, type:"income", category:"דוח יומי", amount: report.credit, date, description:"אשראי", addedBy, addedAt: now(), fromDaily:true, dailyDate:date })
    return entries
  }

  function submit() {
    if (lockedMonths.includes(form.date.slice(0, 7))) { show("🔒 חודש זה נעול", false); return }
    if (tooOld(form.date, cu.role)) { show("לא ניתן להוסיף לתאריך ישן", false); return }
    if (!form.diners && !form.cash && !form.credit) { show("מלא לפחות שדה אחד", false); return }

    const entry = {
      id:      existingReport?.id || Date.now(),
      date:    form.date,
      diners:  Number(form.diners)  || 0,
      cash:    Number(form.cash)    || 0,
      credit:  Number(form.credit)  || 0,
      note:    form.note,
      addedBy: cu.name,
      addedAt: now(),
    }

    if (existingReport) {
      sDaily(p => p.map(r => r.date === form.date ? entry : r))
      sTxs(p => [...makeIncomeEntries(entry, form.date, cu.name), ...p.filter(tx => !(tx.fromDaily && tx.dailyDate === form.date))])
      addLog("עדכון דוח", form.date, cu)
      show("דוח עודכן!")
    } else {
      sDaily(p => [entry, ...p])
      const newEntries = makeIncomeEntries(entry, form.date, cu.name)
      if (newEntries.length) sTxs(p => [...newEntries, ...p])
      addLog("הוספת דוח", form.date, cu)
      show("דוח נשמר!")
    }
    setForm(f => ({ ...f, diners: "", cash: "", credit: "", note: "" }))
  }

  function saveEdit(report) {
    if (tooOld(report.date, cu.role)) { show("לא ניתן לערוך", false); return }
    const updated = { ...report, diners: Number(editForm.diners)||0, cash: Number(editForm.cash)||0, credit: Number(editForm.credit)||0, note: editForm.note, editedBy: cu.name }
    sDaily(p => p.map(x => x.id === report.id ? updated : x))
    sTxs(p => [...makeIncomeEntries(updated, report.date, cu.name), ...p.filter(tx => !(tx.fromDaily && tx.dailyDate === report.date))])
    addLog("עריכת דוח", report.date, cu)
    show("עודכן!")
    setEditId(null)
  }

  function deleteReport(report) {
    sDaily(p => p.filter(x => x.id !== report.id))
    sTxs(p => p.filter(tx => !(tx.fromDaily && tx.dailyDate === report.date)))
    addLog("מחיקת דוח", report.date, cu)
    show("נמחק!")
  }

  const sorted       = [...daily].sort((a, b) => b.date.localeCompare(a.date))
  const todayStr     = bizDay()
  const yesterdayStr = yesterday()

  return (
    <div>
      {Toast}
      <PageTitle title="דוח יומי" />

      {/* Form */}
      <Card title={existingReport ? "עדכן דוח קיים" : "דוח חדש"} accent={existingReport ? T.or : T.pr}>
        {existingReport && (
          <div style={{
            background: T.or3, border: "1px solid rgba(255,159,10,0.3)",
            borderRadius: 10, padding: "10px 14px",
            fontSize: 12, color: T.or, marginBottom: 14,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>⚠️</span> קיים דוח לתאריך זה – שמירה תעדכן אותו
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Inp label="תאריך" val={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} type="date" />

          <G2>
            <Inp label="בונים" val={form.diners} onChange={v => setForm(f => ({ ...f, diners: v }))} type="number" ph="0" />
            <Inp label="מזומן ₪" val={form.cash} onChange={v => setForm(f => ({ ...f, cash: v }))} type="number" ph="0" />
          </G2>
          <G2>
            <Inp label="אשראי ₪" val={form.credit} onChange={v => setForm(f => ({ ...f, credit: v }))} type="number" ph="0" />
            <Inp label="הערות" val={form.note} onChange={v => setForm(f => ({ ...f, note: v }))} ph="הערה..." />
          </G2>

          {formTotal > 0 && (
            <div style={{
              background: "linear-gradient(135deg, rgba(0,200,120,0.1), rgba(0,200,120,0.04))",
              borderRadius: 12, padding: "14px 18px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              border: "1px solid rgba(0,200,120,0.2)",
            }}>
              <span style={{ fontSize: 13, color: T.tx2, fontWeight: 600 }}>סה"כ להיום</span>
              <span style={{ fontWeight: 900, fontSize: 20, color: T.gn }}>{money(formTotal)}</span>
            </div>
          )}

          {cu.role !== "admin" && (
            <div style={{ fontSize: 12, color: T.tx2, background: T.card2, padding: "10px 14px", borderRadius: 10, border: "1px solid " + T.border, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔒</span> אחמש: ניתן להוסיף להיום או יום אחד אחורה בלבד
            </div>
          )}

          <Btn onClick={submit} s={{ width: "100%", height: 50 }}>
            {existingReport ? "✓ עדכן דוח" : "✓ שמור דוח"}
          </Btn>
          <div style={{ fontSize: 11, color: T.tx3, textAlign: "center" }}>
            מזומן ואשראי יתווספו אוטומטית להכנסות
          </div>
        </div>
      </Card>

      {/* Reports list */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.tx }}>דוחות קודמים</h3>
          <span style={{ fontSize: 12, color: T.tx3, background: T.card2, border: "1px solid " + T.border, borderRadius: 20, padding: "3px 10px" }}>
            {daily.length} דוחות
          </span>
        </div>

        {sorted.length === 0 ? (
          <Card><Empty text="אין דוחות עדיין" icon="📋" /></Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map(r => {
              const isEditing   = editId === r.id
              const isToday     = r.date === todayStr
              const isYesterday = r.date === yesterdayStr
              const total       = (r.cash || 0) + (r.credit || 0)
              const accentColor = isEditing ? T.pr : isToday ? T.gn : isYesterday ? T.or : T.border

              return (
                <div key={r.id} style={{
                  background: T.card, borderRadius: 16,
                  border: "1px solid " + accentColor,
                  overflow: "hidden", boxShadow: T.sh,
                  transition: "border-color .2s",
                }}>
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: T.tx }}>{dayNm(r.date)}</span>
                          {isToday     && <span style={{ fontSize: 10, fontWeight: 700, color: T.gn,  background: T.gn2,  padding: "2px 9px", borderRadius: 20, border: "1px solid rgba(0,200,120,0.25)" }}>היום</span>}
                          {isYesterday && <span style={{ fontSize: 10, fontWeight: 700, color: T.or,  background: T.or2,  padding: "2px 9px", borderRadius: 20, border: "1px solid rgba(255,159,10,0.25)" }}>אתמול</span>}
                        </div>
                        <div style={{ fontSize: 12, color: T.tx2, marginBottom: r.note ? 4 : 0 }}>
                          <span style={{ color: T.or, fontWeight: 600 }}>{r.diners}</span> בונים
                          {" · "}
                          <span style={{ color: T.gn }}>מזומן {money(r.cash || 0)}</span>
                          {" · "}
                          <span style={{ color: T.pu }}>אשראי {money(r.credit || 0)}</span>
                        </div>
                        {r.note      && <div style={{ fontSize: 11, color: T.tx3, marginTop: 2 }}>💬 {r.note}</div>}
                        {r.editedBy  && <div style={{ fontSize: 10, color: T.tx3, marginTop: 2 }}>✏️ עודכן ע"י {r.editedBy}</div>}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <span style={{ fontWeight: 900, fontSize: 18, color: total > 0 ? T.gn : T.tx2 }}>
                          {money(total)}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => {
                              if (isEditing) setEditId(null)
                              else { setEditId(r.id); setEditForm({ diners: String(r.diners||""), cash: String(r.cash||""), credit: String(r.credit||""), note: r.note||"" }) }
                            }}
                            style={{ ...S.btnSm, color: isEditing ? T.pr : T.tx2, borderColor: isEditing ? T.pr : T.border }}
                          >
                            {isEditing ? "✕" : "✏️"}
                          </button>
                          {cu.role === "admin" && (
                            <button
                              onClick={() => deleteReport(r)}
                              style={{ ...S.btnSm, color: T.rd, borderColor: "rgba(255,64,85,0.3)" }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inline edit */}
                  {isEditing && (
                    <div style={{ background: T.card2, borderTop: "1px solid " + T.border, padding: "16px 18px", animation: "pageIn .2s ease" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.pr, marginBottom: 14 }}>
                        ✏️ עריכת דוח – {dayNm(r.date)}
                      </div>
                      <G2>
                        <Inp label="בונים"  val={editForm.diners} onChange={v => setEditForm(f => ({ ...f, diners: v }))} type="number" />
                        <Inp label="מזומן"  val={editForm.cash}   onChange={v => setEditForm(f => ({ ...f, cash: v }))}   type="number" />
                        <Inp label="אשראי"  val={editForm.credit} onChange={v => setEditForm(f => ({ ...f, credit: v }))} type="number" />
                        <Inp label="הערות"  val={editForm.note}   onChange={v => setEditForm(f => ({ ...f, note: v }))} />
                      </G2>
                      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                        <Btn onClick={() => saveEdit(r)} s={{ flex: 1, height: 42, fontSize: 13 }}>שמור</Btn>
                        <button onClick={() => setEditId(null)} style={{ ...S.btnSm, flex: 1, height: 42, justifyContent: "center" }}>ביטול</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
