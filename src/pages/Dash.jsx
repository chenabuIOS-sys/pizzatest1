import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { T, S, MN, Card, Stat, IRow, PageTitle, G2, Empty, InfoBanner, money, bizDay, dayNm } from '../shared'

export function Dash({ txs, daily }) {
  const tod = bizDay()
  const [sm, setSm] = useState(tod.slice(0, 7))

  const mTxs   = useMemo(() => txs.filter(t => t.date.startsWith(sm)), [txs, sm])
  const inc    = useMemo(() => mTxs.filter(t => t.type === "income" ).reduce((s, t) => s + Number(t.amount), 0), [mTxs])
  const exp    = useMemo(() => mTxs.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0), [mTxs])
  const mDly   = useMemo(() => daily.filter(r => r.date.startsWith(sm)), [daily, sm])
  const diners = mDly.reduce((s, r) => s + Number(r.diners || 0), 0)

  const todayReport = daily.find(r => r.date === tod)
  const lastRep     = useMemo(() => [...daily].sort((a, b) => b.date.localeCompare(a.date))[0], [daily])

  const [y, m] = sm.split("-").map(Number)

  const chartData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const mm  = ((m - 5 + i - 1 + 12) % 12) + 1
    const yy  = y + (m - 5 + i <= 0 ? -1 : 0)
    const pfx = yy + "-" + String(mm).padStart(2, "0")
    return {
      name: MN[mm - 1].slice(0, 3),
      inc:  txs.filter(t => t.type === "income"  && t.date.startsWith(pfx)).reduce((s, t) => s + Number(t.amount), 0),
      exp:  txs.filter(t => t.type === "expense" && t.date.startsWith(pfx)).reduce((s, t) => s + Number(t.amount), 0),
    }
  }), [txs, m, y])

  const topCats = useMemo(() => {
    const cats = {}
    mTxs.filter(t => t.type === "expense").forEach(t => { cats[t.category] = (cats[t.category] || 0) + Number(t.amount) })
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [mTxs])

  const profit = inc - exp

  return (
    <div>
      <PageTitle
        title="לוח בקרה"
        sub={dayNm(tod)}
        action={
          <input
            type="month"
            value={sm}
            onChange={ev => setSm(ev.target.value)}
            style={{ ...S.field, width: 128, height: 36, fontSize: 12, padding: "0 8px" }}
          />
        }
      />

      {/* Today's report status */}
      <InfoBanner
        ok={!!todayReport}
        icon={todayReport ? "✅" : "⚠️"}
        title={todayReport ? "דוח יומי הוגש היום" : "דוח יומי לא הוגש עדיין"}
        sub={todayReport
          ? `${todayReport.diners} בונים · מזומן ${money(todayReport.cash || 0)} · אשראי ${money(todayReport.credit || 0)}`
          : 'לחץ על "דוח יומי" להוספה'}
      />

      {/* KPI stats */}
      <G2 gap={12}>
        <Stat label="הכנסות"  val={money(inc)}    icon="📈" color={T.gn}                    bg={T.gn2} />
        <Stat label="הוצאות"  val={money(exp)}    icon="📉" color={T.rd}                    bg={T.rd2} />
        <Stat label="רווח"    val={money(profit)} icon="💰" color={profit >= 0 ? T.gn : T.rd} bg={profit >= 0 ? T.gn2 : T.rd2} />
        <Stat label="בונים"   val={diners}        icon="🍽" color={T.or}                    bg={T.or2} />
      </G2>

      {/* Last report */}
      {lastRep && (
        <div style={{ marginTop: 16 }}>
          <Card title={"דוח אחרון · " + dayNm(lastRep.date)}>
            <G2 gap={10}>
              <IRow label="מזומן"  val={money(lastRep.cash   || 0)} color={T.gn} />
              <IRow label="אשראי"  val={money(lastRep.credit || 0)} color={T.pu} />
              <IRow label="בונים"  val={lastRep.diners || 0}        color={T.or} />
              <IRow label='סה"כ'   val={money((lastRep.cash || 0) + (lastRep.credit || 0))} color={T.pr} bold />
            </G2>
          </Card>
        </div>
      )}

      {/* 6-month chart */}
      <div style={{ marginTop: 16 }}>
        <Card title="הכנסות מול הוצאות – 6 חודשים">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={chartData} barGap={4} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
              <XAxis dataKey="name" stroke={T.tx3} tick={{ fontSize: 11, fill: T.tx2, fontFamily: "Heebo" }} axisLine={false} tickLine={false} />
              <YAxis stroke={T.tx3} tick={{ fontSize: 10, fill: T.tx3, fontFamily: "Heebo" }} tickFormatter={v => v > 999 ? (v / 1000).toFixed(0) + "k" : v} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v, n) => [money(v), n === "inc" ? "הכנסות" : "הוצאות"]}
                contentStyle={{ background: T.card2, border: "1px solid " + T.border, borderRadius: 12, color: T.tx, fontSize: 12, fontFamily: "Heebo", direction: "rtl" }}
                cursor={{ fill: "rgba(255,255,255,0.04)", radius: 6 }}
              />
              <Bar dataKey="inc" fill={T.gn}  radius={[5,5,0,0]} />
              <Bar dataKey="exp" fill={T.rd}  radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.tx2 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: T.gn }} />הכנסות
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.tx2 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: T.rd }} />הוצאות
            </div>
          </div>
        </Card>
      </div>

      {/* Top expense categories */}
      {topCats.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Card title="הוצאות לפי ספק">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topCats.map(([cat, amt]) => (
                <div key={cat} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", background: T.card2,
                  borderRadius: 12, border: "1px solid " + T.border,
                }}>
                  <span style={{ fontSize: 13, color: T.tx, fontWeight: 500 }}>{cat}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 64, height: 5, background: T.border, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: (exp > 0 ? Math.min(amt / exp * 100, 100) : 0) + "%",
                        background: `linear-gradient(90deg, ${T.rd}, ${T.pr})`,
                        borderRadius: 3,
                        transition: "width .6s ease",
                      }} />
                    </div>
                    <span style={{ fontWeight: 700, color: T.rd, minWidth: 64, textAlign: "left", fontSize: 13 }}>
                      {money(amt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {txs.length === 0 && daily.length === 0 && (
        <div style={{ marginTop: 16 }}>
          <Card>
            <Empty text="אין נתונים עדיין – הוסף דוח יומי כדי להתחיל" icon="🚀" />
          </Card>
        </div>
      )}
    </div>
  )
}
