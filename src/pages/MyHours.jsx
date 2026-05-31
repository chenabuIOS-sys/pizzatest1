import { useState } from 'react'
import { T, MN, Card, Stat, G2, Empty, PageTitle, money, bizDay, dayNm } from '../shared'

const PERIODS = [
  { id: "day",    label: "יום",      days: 0 },
  { id: "week",   label: "שבוע",     days: 6 },
  { id: "month",  label: "חודש",     days: 30 },
  { id: "6month", label: "חצי שנה", days: 180 },
  { id: "year",   label: "שנה",      days: 365 },
]

export function MyHours({ cu, hrs, emps }) {
  const linkedEmp = emps.find(e => e.linkedUserId === cu.id)
  const [period, setPeriod] = useState("month")

  if (!linkedEmp) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center" }}>
        <div style={{ fontSize: 64 }}>👤</div>
        <h2 style={{ color: T.tx, margin: 0 }}>שלום, {cu.name}!</h2>
        <p style={{ color: T.tx2, margin: 0 }}>החשבון שלך לא מקושר לעובד. פנה למנהל.</p>
      </div>
    )
  }

  const empHours = hrs.filter(h => h.employeeId === linkedEmp.id)
  const tod      = bizDay()
  const p        = PERIODS.find(x => x.id === period) || PERIODS[2]
  const fromDate = (() => { const d = new Date(); d.setDate(d.getDate() - p.days); return d.toISOString().slice(0, 10) })()

  const filtered = empHours.filter(h => h.date >= fromDate && h.date <= tod)
  const byDay    = {}
  filtered.forEach(h => {
    if (!byDay[h.date]) byDay[h.date] = { date: h.date, hours: 0 }
    byDay[h.date].hours += Number(h.hours)
  })
  const dailyList = Object.values(byDay).sort((a, b) => b.date.localeCompare(a.date))

  const periodHours  = filtered.reduce((s, h) => s + Number(h.hours), 0)
  const periodSalary = periodHours * linkedEmp.hourlyRate
  const allHours     = empHours.reduce((s, h) => s + Number(h.hours), 0)
  const allSalary    = allHours * linkedEmp.hourlyRate

  return (
    <div>
      <PageTitle
        title={"שלום, " + linkedEmp.name + "!"}
        sub={linkedEmp.role + " · " + money(linkedEmp.hourlyRate) + "/שעה"}
      />

      {/* Period selector */}
      <div style={{ display: "flex", background: T.card, borderRadius: 12, padding: 4, gap: 3, border: "1px solid "+T.border, marginBottom: 16, boxShadow: T.sh }}>
        {PERIODS.map(x => (
          <button
            key={x.id}
            onClick={() => setPeriod(x.id)}
            style={{ flex: 1, border: "none", borderRadius: 9, padding: "9px 4px", background: period === x.id ? T.pr : "transparent", color: period === x.id ? "#fff" : T.tx2, fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "background .15s" }}
          >
            {x.label}
          </button>
        ))}
      </div>

      <G2 gap={12}>
        <Stat label={"שעות " + p.label} val={periodHours.toFixed(1)}  icon="⏱" color={T.pr} bg={T.rd2} />
        <Stat label={"שכר " + p.label}  val={money(periodSalary)}     icon="💰" color={T.gn} bg={T.gn2} />
        <Stat label='סה"כ שעות'          val={allHours.toFixed(1)}     icon="📊" color={T.or} bg={T.or2} />
        <Stat label='סה"כ שכר'           val={money(allSalary)}        icon="💵" color={T.pu} bg={T.pu2} />
      </G2>

      <div style={{ marginTop: 16 }}>
        <Card title={"פירוט – " + p.label}>
          {dailyList.length === 0 ? (
            <Empty text="אין שעות בתקופה זו" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dailyList.map(day => (
                <div key={day.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: T.card2, borderRadius: 10, border: "1px solid "+T.border }}>
                  <div>
                    <div style={{ fontWeight: 700, color: T.or, fontSize: 14 }}>{day.hours.toFixed(1)} שעות</div>
                    <div style={{ fontSize: 12, color: T.tx2, marginTop: 2 }}>{dayNm(day.date)}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: T.gn }}>{money(day.hours * linkedEmp.hourlyRate)}</span>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "rgba(46,204,113,0.08)", borderRadius: 10, border: "1px solid rgba(46,204,113,0.2)", marginTop: 4 }}>
                <span style={{ fontWeight: 700, color: T.tx }}>סה"כ {p.label}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 800, color: T.gn }}>{money(periodSalary)}</div>
                  <div style={{ fontSize: 11, color: T.tx2 }}>{periodHours.toFixed(1)} שעות</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
