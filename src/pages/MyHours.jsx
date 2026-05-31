import { useState } from 'react'
import { T, S, MN, Card, Stat, G2, Empty, PageTitle, SegTabs, money, bizDay, dayNm } from '../shared'

const PERIODS = [
  { id: "day",    label: "יום",     days: 0 },
  { id: "week",   label: "שבוע",    days: 6 },
  { id: "month",  label: "חודש",    days: 30 },
  { id: "6month", label: "חצי שנה", days: 180 },
  { id: "year",   label: "שנה",     days: 365 },
]

export function MyHours({ cu, hrs, emps }) {
  const linkedEmp = emps.find(e => e.linkedUserId === cu.id)
  const [period, setPeriod] = useState("month")

  if (!linkedEmp) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "60vh", gap: 18, textAlign: "center",
        padding: 24,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: T.card2, border: "1px solid " + T.border,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
        }}>
          👤
        </div>
        <div>
          <h2 style={{ color: T.tx, margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>שלום, {cu.name}!</h2>
          <p style={{ color: T.tx2, margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            החשבון שלך לא מקושר לעובד.<br />
            פנה למנהל לקישור.
          </p>
        </div>
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
        title={"שלום, " + linkedEmp.name.split(" ")[0] + "!"}
        sub={linkedEmp.role + " · " + money(linkedEmp.hourlyRate) + " לשעה"}
      />

      {/* Period selector */}
      <div style={{ marginBottom: 20 }}>
        <SegTabs
          options={PERIODS.map(x => ({ id: x.id, label: x.label }))}
          value={period}
          onChange={setPeriod}
        />
      </div>

      {/* Stats */}
      <G2 gap={12}>
        <Stat label={"שעות – " + p.label} val={periodHours.toFixed(1)}  icon="⏱" color={T.pr} bg={T.pr2} />
        <Stat label={"שכר – " + p.label}  val={money(periodSalary)}     icon="💰" color={T.gn} bg={T.gn2} />
        <Stat label='סה"כ שעות'            val={allHours.toFixed(1)}     icon="📊" color={T.or} bg={T.or2} />
        <Stat label='סה"כ שכר'             val={money(allSalary)}        icon="💵" color={T.pu} bg={T.pu2} />
      </G2>

      {/* Daily breakdown */}
      <div style={{ marginTop: 20 }}>
        <Card title={"פירוט – " + p.label} accent={T.pr}>
          {dailyList.length === 0 ? (
            <Empty text="אין שעות בתקופה זו" icon="⏱" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dailyList.map(day => {
                const daySalary = day.hours * linkedEmp.hourlyRate
                return (
                  <div key={day.date} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 16px",
                    background: T.card2, borderRadius: 12, border: "1px solid " + T.border,
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: T.or, fontSize: 15, lineHeight: 1 }}>
                        {day.hours.toFixed(1)} שעות
                      </div>
                      <div style={{ fontSize: 12, color: T.tx2, marginTop: 4 }}>{dayNm(day.date)}</div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 800, color: T.gn, fontSize: 15 }}>{money(daySalary)}</div>
                    </div>
                  </div>
                )
              })}

              {/* Total */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 18px",
                background: "linear-gradient(135deg, rgba(0,200,120,0.10), rgba(0,200,120,0.03))",
                borderRadius: 14, border: "1px solid rgba(0,200,120,0.22)", marginTop: 4,
              }}>
                <span style={{ fontWeight: 700, color: T.tx, fontSize: 14 }}>סה"כ {p.label}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 900, color: T.gn, fontSize: 18 }}>{money(periodSalary)}</div>
                  <div style={{ fontSize: 11, color: T.tx2, marginTop: 2 }}>{periodHours.toFixed(1)} שעות</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
