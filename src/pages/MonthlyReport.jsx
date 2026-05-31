import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { T, S, MN, Card, Stat, IRow, G2, useToast, PageTitle, Inp, Btn, SegTabs, useLS, money, bizDay } from '../shared'

export function MonthlyReport({ txs, hrs, emps, daily }) {
  const [sm, setSm]                      = useState(bizDay().slice(0, 7))
  const [target, setTarget]              = useLS("biz_target", 0)
  const [lockedMonths, setLockedMonths]  = useLS("biz_locked", [])
  const [editTarget, setEditTarget]      = useState(false)
  const [targetInput, setTargetInput]    = useState("")
  const [showCompare, setShowCompare]    = useState(false)
  const { Toast } = useToast()

  const [yr, mn] = sm.split("-").map(Number)
  const pmn      = mn === 1 ? 12 : mn - 1
  const pyr      = mn === 1 ? yr - 1 : yr
  const prevSm   = pyr + "-" + String(pmn).padStart(2, "0")

  const isLocked   = lockedMonths.includes(sm)
  const toggleLock = () => setLockedMonths(p => p.includes(sm) ? p.filter(x => x !== sm) : [...p, sm])

  const mTxs = useMemo(() => txs.filter(t => t.date.startsWith(sm)),     [txs, sm])
  const pTxs = useMemo(() => txs.filter(t => t.date.startsWith(prevSm)), [txs, prevSm])
  const mHrs = useMemo(() => hrs.filter(h => h.date.startsWith(sm)),     [hrs, sm])
  const mDly = useMemo(() => daily.filter(r => r.date.startsWith(sm)),   [daily, sm])

  const inc    = mTxs.filter(t => t.type === "income" ).reduce((s, t) => s + Number(t.amount), 0)
  const exp    = mTxs.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)
  const pInc   = pTxs.filter(t => t.type === "income" ).reduce((s, t) => s + Number(t.amount), 0)
  const pExp   = pTxs.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)
  const cash   = mDly.reduce((s, r) => s + Number(r.cash   || 0), 0)
  const credit = mDly.reduce((s, r) => s + Number(r.credit || 0), 0)
  const diners = mDly.reduce((s, r) => s + Number(r.diners || 0), 0)

  const expByCat = useMemo(() => {
    const cats = {}
    mTxs.filter(t => t.type === "expense").forEach(t => { cats[t.category] = (cats[t.category] || 0) + Number(t.amount) })
    return Object.entries(cats).sort((a, b) => b[1] - a[1])
  }, [mTxs])

  const empSummary = useMemo(() => emps.map(emp => {
    const empHrs = mHrs.filter(h => h.employeeId === emp.id).reduce((s, h) => s + Number(h.hours), 0)
    return { ...emp, hours: empHrs, salary: empHrs * emp.hourlyRate }
  }).filter(e => e.hours > 0), [emps, mHrs])

  const totalSalary = empSummary.reduce((s, e) => s + e.salary, 0)
  const netProfit   = inc - exp - totalSalary
  const targetNum   = Number(target) || 0
  const targetPct   = targetNum > 0 ? Math.min((inc / targetNum) * 100, 100) : 0

  function pctChg(cur, prev) {
    if (prev === 0) return null
    return ((cur - prev) / Math.abs(prev) * 100)
  }
  const incChg  = pctChg(inc, pInc)
  const expChg  = pctChg(exp, pExp)
  const profChg = pctChg(netProfit, pInc - pExp)
  const fmtChg  = d => d === null ? null : (d >= 0 ? "▲ +" : "▼ ") + Math.abs(d).toFixed(1) + "%"

  function exportCSV() {
    const rows = [
      ["תאריך","סוג","קטגוריה","תיאור","סכום","מוסיף"],
      ...mTxs.map(t => [t.date, t.type === "income" ? "הכנסה" : "הוצאה", t.category, t.description||"", t.amount, t.addedBy])
    ]
    const csv  = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = "דוח_" + MN[mn-1] + "_" + yr + ".csv"; a.click()
    URL.revokeObjectURL(url)
  }

  function shareWhatsApp() {
    const lines = [
      "📊 דוח " + MN[mn-1] + " " + yr + " – פיצה טוסקנה",
      "💰 הכנסות: " + money(inc),
      "📉 הוצאות: " + money(exp),
      "💵 שכר: " + money(totalSalary),
      netProfit >= 0 ? "✅ רווח נקי: " + money(netProfit) : "❌ הפסד: " + money(netProfit),
      "🍽 בונים: " + diners,
    ]
    window.open("https://wa.me/?text=" + encodeURIComponent(lines.join("\n")), "_blank")
  }

  return (
    <div>
      {Toast}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: T.tx, letterSpacing: "-0.5px" }}>
              {MN[mn-1]} {yr}
            </h1>
            {isLocked && (
              <span style={{ fontSize: 11, color: T.or, background: T.or2, padding: "2px 10px", borderRadius: 20, border: "1px solid rgba(255,159,10,0.3)" }}>
                🔒 נעול
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <input type="month" value={sm} onChange={ev => setSm(ev.target.value)} style={{ ...S.field, width: 128, height: 34, fontSize: 12, padding: "0 8px" }} />
            <button onClick={() => setSm(bizDay().slice(0, 7))} style={{ ...S.btnSm, height: 34 }}>החודש</button>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={exportCSV}     style={{ ...S.btnSm, height: 34, color: T.gn,      borderColor: "rgba(0,200,120,0.35)" }}>📥 CSV</button>
          <button onClick={shareWhatsApp} style={{ ...S.btnSm, height: 34, color: "#25D366", borderColor: "rgba(37,211,102,0.35)" }}>💬 שלח</button>
          <button onClick={() => window.print()} style={{ ...S.btnSm, height: 34, color: T.bl,  borderColor: "rgba(10,132,255,0.35)" }}>🖨️ הדפס</button>
          <button
            onClick={toggleLock}
            style={{ ...S.btnSm, height: 34, color: isLocked ? T.or : T.tx2, borderColor: isLocked ? "rgba(255,159,10,0.4)" : T.border, background: isLocked ? T.or2 : T.card2 }}
          >
            {isLocked ? "🔓 פתח" : "🔒 נעל"}
          </button>
        </div>
      </div>

      {isLocked && (
        <div style={{ background: T.or2, border: "1px solid rgba(255,159,10,0.3)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: T.or, marginBottom: 16, display: "flex", gap: 8 }}>
          <span>🔒</span> חודש זה נעול – לא ניתן לערוך נתונים. לחץ "פתח" לביטול הנעילה.
        </div>
      )}

      {/* Toggle buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setShowCompare(v => !v)}
          style={{
            ...S.btnSm, flex: 1, justifyContent: "center",
            background: showCompare ? T.bl2 : T.card2,
            borderColor: showCompare ? T.bl : T.border,
            color: showCompare ? T.bl : T.tx2,
          }}
        >
          📊 השוואה לחודש קודם
        </button>
        <button
          onClick={() => { setEditTarget(v => !v); setTargetInput(String(targetNum || "")) }}
          style={{
            ...S.btnSm, flex: 1, justifyContent: "center",
            background: targetNum ? T.or2 : T.card2,
            borderColor: targetNum ? T.or : T.border,
            color: targetNum ? T.or : T.tx2,
          }}
        >
          🎯 {targetNum ? "יעד: " + money(targetNum) : "הגדר יעד"}
        </button>
      </div>

      {/* Target editor */}
      {editTarget && (
        <Card mb={16} accent={T.or}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Inp label="יעד הכנסות חודשי" val={targetInput} onChange={setTargetInput} type="number" ph="לדוגמה 50000" />
            </div>
            <Btn onClick={() => { setTarget(Number(targetInput) || 0); setEditTarget(false) }} s={{ alignSelf: "flex-end" }}>שמור</Btn>
            {targetNum > 0 && (
              <button onClick={() => { setTarget(0); setEditTarget(false) }} style={{ ...S.btnSm, color: T.rd, borderColor: "rgba(255,64,85,0.3)", alignSelf: "flex-end" }}>הסר</button>
            )}
          </div>
        </Card>
      )}

      {/* Target progress bar */}
      {targetNum > 0 && (
        <Card mb={16}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: T.tx2 }}>יעד: {money(targetNum)}</span>
            <span style={{ fontWeight: 900, fontSize: 18, color: targetPct >= 100 ? T.gn : T.or }}>{targetPct.toFixed(0)}%</span>
          </div>
          <div style={{ height: 10, background: T.card2, borderRadius: 5, overflow: "hidden", border: "1px solid " + T.border }}>
            <div style={{
              height: "100%",
              width: targetPct + "%",
              background: targetPct >= 100
                ? `linear-gradient(90deg, ${T.gn}, #00A060)`
                : `linear-gradient(90deg, ${T.or}, ${T.pr})`,
              borderRadius: 5, maxWidth: "100%",
              transition: "width .6s ease",
            }} />
          </div>
          <div style={{ fontSize: 11, color: T.tx3, marginTop: 8, textAlign: "center" }}>
            {targetPct >= 100
              ? "🎉 יעד הושג! " + money(inc - targetNum) + " מעל היעד"
              : "חסר " + money(targetNum - inc) + " · " + money(inc) + " מתוך " + money(targetNum)}
          </div>
        </Card>
      )}

      {/* KPI stats */}
      <G2 gap={12}>
        <Stat label="הכנסות"   val={money(inc)}         icon="📈" color={T.gn} bg={T.gn2} sub={showCompare && incChg  !== null ? fmtChg(incChg)  : null} />
        <Stat label="הוצאות"   val={money(exp)}         icon="📉" color={T.rd} bg={T.rd2} sub={showCompare && expChg  !== null ? fmtChg(expChg)  : null} />
        <Stat label="שכר"      val={money(totalSalary)} icon="👥" color={T.or} bg={T.or2} />
        <Stat label="רווח נקי" val={money(netProfit)}   icon="💰" color={netProfit >= 0 ? T.gn : T.rd} bg={netProfit >= 0 ? T.gn2 : T.rd2} sub={showCompare && profChg !== null ? fmtChg(profChg) : null} />
      </G2>

      {/* Income summary */}
      <div style={{ marginTop: 16 }}>
        <Card title="סיכום הכנסות" accent={T.gn}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <IRow label="מזומן"          val={money(cash)}   color={T.gn} />
            <IRow label="אשראי"          val={money(credit)} color={T.pu} />
            <IRow label="בונים"          val={diners}        color={T.or} />
            {diners > 0 && <IRow label="ממוצע לבוני" val={money(Math.round(inc / diners))} color={T.bl} />}
            <IRow label='סה"כ הכנסות'   val={money(inc)}    color={T.gn} bold />
          </div>
        </Card>
      </div>

      {/* Expenses by supplier */}
      {expByCat.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Card title="הוצאות לפי ספק" accent={T.rd}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {expByCat.map(([cat, amt]) => (
                <div key={cat} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", background: T.card2, borderRadius: 12, border: "1px solid " + T.border,
                }}>
                  <span style={{ fontSize: 13, color: T.tx, fontWeight: 500 }}>{cat}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 56, height: 5, background: T.border, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: (exp > 0 ? Math.min(amt/exp*100,100) : 0) + "%",
                        background: `linear-gradient(90deg, ${T.rd}, ${T.pr})`,
                        borderRadius: 3,
                      }} />
                    </div>
                    <span style={{ fontWeight: 700, color: T.rd, minWidth: 68, textAlign: "left", fontSize: 13 }}>{money(amt)}</span>
                  </div>
                </div>
              ))}
              <IRow label='סה"כ הוצאות' val={money(exp)} color={T.rd} bold />
            </div>
          </Card>
        </div>
      )}

      {/* Employee salaries */}
      {empSummary.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Card title="שכר עובדים" accent={T.or}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {empSummary.map(emp => (
                <div key={emp.id} style={{ padding: "13px 14px", background: T.card2, borderRadius: 12, border: "1px solid " + T.border }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 9,
                        background: `linear-gradient(135deg,${T.pr},${T.or})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, color: "#fff",
                      }}>
                        {emp.name[0]}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.tx }}>{emp.name}</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 900, color: T.gn }}>{money(emp.salary)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.tx2, paddingRight: 40 }}>
                    {emp.hours.toFixed(1)} שעות × {money(emp.hourlyRate)}/שעה
                  </div>
                </div>
              ))}
              <IRow label='סה"כ שכר' val={money(totalSalary)} color={T.or} bold />
            </div>
          </Card>
        </div>
      )}

      {/* P&L */}
      <div style={{ marginTop: 16 }}>
        <Card title="רווח והפסד">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <IRow label="הכנסות"      val={money(inc)}         color={T.gn} />
            <IRow label="הוצאות"      val={"- " + money(exp)}  color={T.rd} />
            <IRow label="שכר עובדים"  val={"- " + money(totalSalary)} color={T.or} />
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "18px 18px",
              background: netProfit >= 0
                ? "linear-gradient(135deg, rgba(0,200,120,0.12), rgba(0,200,120,0.04))"
                : "linear-gradient(135deg, rgba(255,64,85,0.12), rgba(255,64,85,0.04))",
              borderRadius: 14,
              border: "1px solid " + (netProfit >= 0 ? "rgba(0,200,120,0.25)" : "rgba(255,64,85,0.25)"),
              marginTop: 4,
            }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: T.tx }}>רווח נקי</span>
              <span style={{ fontWeight: 900, fontSize: 26, color: netProfit >= 0 ? T.gn : T.rd, letterSpacing: "-0.5px" }}>
                {money(netProfit)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Month comparison */}
      {showCompare && (
        <div style={{ marginTop: 16 }}>
          <Card title={`השוואה: ${MN[mn-1]} vs ${MN[pmn-1]}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "הכנסות", cur: inc,       prev: pInc,      color: T.gn },
                { label: "הוצאות", cur: exp,       prev: pExp,      color: T.rd },
                { label: "רווח",   cur: netProfit, prev: pInc-pExp, color: netProfit >= 0 ? T.gn : T.rd },
              ].map(x => {
                const delta = x.prev !== 0 ? ((x.cur - x.prev) / Math.abs(x.prev) * 100) : null
                return (
                  <div key={x.label} style={{ padding: "14px", background: T.card2, borderRadius: 12, border: "1px solid " + T.border }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.tx2 }}>{x.label}</span>
                      {delta !== null && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: delta >= 0 ? T.gn : T.rd }}>
                          {fmtChg(delta)}
                        </span>
                      )}
                    </div>
                    <G2 gap={8}>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: T.tx2, marginBottom: 4, fontWeight: 600 }}>{MN[mn-1]}</div>
                        <div style={{ fontWeight: 800, color: x.color, fontSize: 15 }}>{money(x.cur)}</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: T.tx2, marginBottom: 4, fontWeight: 600 }}>{MN[pmn-1]}</div>
                        <div style={{ fontWeight: 800, color: T.tx2, fontSize: 15 }}>{money(x.prev)}</div>
                      </div>
                    </G2>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
