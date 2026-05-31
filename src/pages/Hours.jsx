import { useState } from 'react'
import { T, S, MN, Card, Inp, G2, Btn, useToast, PageTitle, Empty, useLS, now, money, bizDay, dayNm, tooOld } from '../shared'

export function Hours({ hrs, sHrs, emps, cu, addLog }) {
  const [lockedMonths] = useLS("biz_locked", [])
  const canEdit = cu.role === "admin" || cu.role === "achmash"

  const tod = bizDay()
  const [selectedIds, setSelectedIds]   = useState([])
  const [hoursVal, setHoursVal]         = useState("")
  const [date, setDate]                 = useState(tod)
  const [note, setNote]                 = useState("")
  const [pickerOpen, setPickerOpen]     = useState(false)
  const [openEmpId, setOpenEmpId]       = useState(null)
  const [editKey, setEditKey]           = useState(null)
  const [editHours, setEditHours]       = useState("")
  const [month, setMonth]               = useState(tod.slice(0, 7))
  const { show, Toast } = useToast()

  const activeEmps = emps.filter(e => e.active)

  const pickerLabel =
    selectedIds.length === 0 ? "בחר עובדים" :
    selectedIds.length === 1 ? (emps.find(e => e.id === selectedIds[0])?.name || "") :
    selectedIds.length + " עובדים נבחרו"

  function toggleEmp(id) { setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]) }

  function addHours() {
    if (lockedMonths.includes(date.slice(0, 7))) { show("🔒 חודש זה נעול", false); return }
    if (selectedIds.length === 0 || !hoursVal)   { show("בחר עובד והכנס שעות", false); return }
    if (tooOld(date, cu.role))                    { show("לא ניתן להוסיף לתאריך ישן", false); return }

    const newEntries = selectedIds.map((id, i) => ({
      id: Date.now() + i, employeeId: id, hours: Number(hoursVal), date, note, addedBy: cu.name, addedAt: now()
    }))
    sHrs(p => [...p, ...newEntries])
    addLog("הוספת שעות", selectedIds.map(id => emps.find(e => e.id === id)?.name || "").join(", ") + " · " + hoursVal + " שעות", cu)
    show(hoursVal + " שעות נרשמו!")
    setHoursVal(""); setNote(""); setSelectedIds([])
  }

  function deleteHours(ids) {
    if (cu.role !== "admin") { show("רק מנהל יכול למחוק", false); return }
    sHrs(p => p.filter(h => !ids.includes(h.id)))
    show("נמחק!")
  }

  function saveDayEdit(emp, day) {
    const nh = Number(editHours)
    if (!nh || nh <= 0) { show("הכנס שעות תקינות", false); return }
    if (tooOld(day.date, cu.role)) { show("לא ניתן לערוך", false); return }
    const firstId = day.ids[0]
    sHrs(p => [...p.filter(h => !day.ids.includes(h.id)), { ...p.find(h => h.id === firstId), hours: nh, editedBy: cu.name }])
    addLog("עריכת שעות", emp.name + " · " + day.date, cu)
    show("עודכן!")
    setEditKey(null); setEditHours("")
  }

  const [mn, yr] = month.split("-").map(Number)

  const summary = emps.map(emp => {
    const empHrs = hrs.filter(h => h.employeeId === emp.id && h.date.startsWith(month))
    const byDay  = {}
    empHrs.forEach(h => {
      if (!byDay[h.date]) byDay[h.date] = { date: h.date, hours: 0, ids: [] }
      byDay[h.date].hours += Number(h.hours)
      byDay[h.date].ids.push(h.id)
    })
    const days    = Object.values(byDay).sort((a, b) => b.date.localeCompare(a.date))
    const total   = empHrs.reduce((s, h) => s + Number(h.hours), 0)
    return { ...emp, days, totalHours: total, totalSalary: total * emp.hourlyRate }
  })

  const quickDates = [
    { label: "היום",  date: tod },
    { label: "אתמול", date: (() => { const d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10) })() },
    { label: "7 ימים", date: (() => { const d=new Date(); d.setDate(d.getDate()-7); return d.toISOString().slice(0,10) })() },
  ]

  return (
    <div>
      {Toast}
      <PageTitle title="שעות עובדים" />

      {/* ─── Add hours form ─── */}
      <Card title="הוסף שעות">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Employee multi-select */}
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: 11, color: T.tx2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>עובדים</label>
            <button
              onClick={() => setPickerOpen(v => !v)}
              style={{ ...S.field, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", cursor: "pointer", color: selectedIds.length > 0 ? T.tx : T.tx2, border: "1px solid "+(pickerOpen ? T.pr : T.border) }}
            >
              <span>{pickerLabel}</span>
              <span style={{ color: T.tx3 }}>{pickerOpen ? "▲" : "▼"}</span>
            </button>

            {pickerOpen && (
              <div style={{ position: "absolute", top: 76, right: 0, left: 0, zIndex: 50, background: T.card2, border: "1px solid "+T.pr, borderRadius: 12, boxShadow: T.sh, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid "+T.border }}>
                  <span style={{ fontSize: 12, color: T.tx2 }}>{selectedIds.length}/{activeEmps.length} נבחרו</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setSelectedIds(activeEmps.map(e => e.id))} style={{ background: "none", border: "none", color: T.pr, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>בחר הכל</button>
                    <button onClick={() => setSelectedIds([])} style={{ background: "none", border: "none", color: T.tx2, fontSize: 12, cursor: "pointer" }}>נקה</button>
                  </div>
                </div>
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {activeEmps.map((emp, i) => {
                    const selected = selectedIds.includes(emp.id)
                    return (
                      <div
                        key={emp.id}
                        onClick={() => toggleEmp(emp.id)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", cursor: "pointer", borderBottom: i < activeEmps.length-1 ? "1px solid "+T.border : "none", background: selected ? "rgba(230,57,70,0.08)" : "transparent", transition: "background .1s" }}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: 5, border: "2px solid "+(selected ? T.pr : T.tx3), background: selected ? T.pr : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {selected && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                        </div>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${T.pr},${T.or})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{emp.name[0]}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.tx }}>{emp.name}</div>
                          <div style={{ fontSize: 11, color: T.tx2 }}>{money(emp.hourlyRate)}/שעה</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ padding: "10px 14px", borderTop: "1px solid "+T.border }}>
                  <Btn onClick={() => setPickerOpen(false)} s={{ width: "100%", height: 38, fontSize: 13 }}>
                    אישור {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
                  </Btn>
                </div>
              </div>
            )}
          </div>

          {/* Hours + Date */}
          <G2>
            <Inp label="שעות" val={hoursVal} onChange={setHoursVal} type="number" ph="0" />
            <Inp label="תאריך" val={date} onChange={setDate} type="date" />
          </G2>

          {/* Quick date shortcuts */}
          <div style={{ display: "flex", gap: 8 }}>
            {quickDates.map(x => (
              <button
                key={x.label}
                onClick={() => setDate(x.date)}
                style={{ ...S.btnSm, flex: 1, justifyContent: "center", background: date === x.date ? "rgba(230,57,70,0.15)" : T.card2, borderColor: date === x.date ? T.pr : T.border, color: date === x.date ? T.pr : T.tx2 }}
              >
                {x.label}
              </button>
            ))}
          </div>

          <Inp label="הערה" val={note} onChange={setNote} ph="הערה אופציונלית" />

          {cu.role !== "admin" && (
            <div style={{ fontSize: 12, color: T.tx2, background: T.card2, padding: "10px 14px", borderRadius: 10, border: "1px solid "+T.border }}>
              🔒 אחמש: ניתן להוסיף להיום או יום אחד אחורה בלבד
            </div>
          )}

          <Btn onClick={addHours} s={{ width: "100%" }}>הוסף שעות</Btn>
        </div>
      </Card>

      {/* ─── Monthly summary ─── */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.tx }}>
            {MN[mn - 1]} {yr}
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="month" value={month} onChange={ev => setMonth(ev.target.value)} style={{ ...S.field, width: 130, height: 36, fontSize: 12, padding: "0 8px" }} />
            <button onClick={() => setMonth(tod.slice(0, 7))} style={S.btnSm}>החודש</button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {summary.map(emp => {
            const isOpen = openEmpId === emp.id
            return (
              <div key={emp.id} style={{ background: T.card, borderRadius: 14, border: "1px solid "+(isOpen ? T.pr : T.border), boxShadow: T.sh, overflow: "hidden" }}>
                {/* Emp header row */}
                <div
                  onClick={() => setOpenEmpId(isOpen ? null : emp.id)}
                  style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${T.pr},${T.or})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>{emp.name[0]}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.tx }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: T.tx2 }}>{emp.role}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: T.or }}>{emp.totalHours.toFixed(1)}</div>
                      <div style={{ fontSize: 10, color: T.tx2, marginTop: 2 }}>שעות</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: T.gn }}>{money(emp.totalSalary)}</div>
                      <div style={{ fontSize: 10, color: T.tx2, marginTop: 2 }}>שכר</div>
                    </div>
                    <span style={{ color: isOpen ? T.pr : T.tx3, fontSize: 16, fontWeight: 700 }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Daily breakdown */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid "+T.border, padding: "14px 16px" }}>
                    {emp.days.length === 0 ? (
                      <Empty text="אין שעות לחודש זה" />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {emp.days.map(day => {
                          const dk  = emp.id + "_" + day.date
                          const ied = editKey === dk
                          return (
                            <div key={day.date} style={{ background: T.card2, borderRadius: 10, border: "1px solid "+(ied ? T.pr : T.border), overflow: "hidden" }}>
                              <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                  <div style={{ fontWeight: 700, color: T.or, fontSize: 15 }}>{day.hours.toFixed(1)} שעות</div>
                                  <div style={{ fontSize: 12, color: T.tx2, marginTop: 2 }}>{dayNm(day.date)}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontWeight: 700, color: T.gn }}>{money(day.hours * emp.hourlyRate)}</span>
                                  {canEdit && (
                                    <button
                                      onClick={() => { if (ied) { setEditKey(null); setEditHours("") } else { setEditKey(dk); setEditHours(String(day.hours)) } }}
                                      style={{ ...S.btnSm, color: ied ? T.pr : T.tx2, borderColor: ied ? T.pr : T.border }}
                                    >
                                      {ied ? "✕" : "✏️"}
                                    </button>
                                  )}
                                  {cu.role === "admin" && (
                                    <button onClick={() => deleteHours(day.ids)} style={{ ...S.btnSm, color: T.rd, borderColor: "rgba(231,76,60,0.4)" }}>🗑️</button>
                                  )}
                                </div>
                              </div>
                              {ied && (
                                <div style={{ background: T.bg, borderTop: "1px solid "+T.border, padding: "12px 14px" }}>
                                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                                    <div style={{ flex: 1 }}>
                                      <Inp label="שעות חדשות" val={editHours} onChange={setEditHours} type="number" />
                                    </div>
                                    <Btn onClick={() => saveDayEdit(emp, day)} s={{ height: 40, fontSize: 13 }}>שמור</Btn>
                                    <button onClick={() => { setEditKey(null); setEditHours("") }} style={{ ...S.btnSm, height: 40 }}>ביטול</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Monthly total */}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "rgba(46,204,113,0.08)", borderRadius: 10, border: "1px solid rgba(46,204,113,0.2)", marginTop: 4 }}>
                          <span style={{ fontWeight: 700, color: T.tx, fontSize: 13 }}>סה"כ {MN[mn - 1]}</span>
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontWeight: 800, color: T.gn }}>{money(emp.totalSalary)}</div>
                            <div style={{ fontSize: 11, color: T.tx2 }}>{emp.totalHours.toFixed(1)} שעות</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
