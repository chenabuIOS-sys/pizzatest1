import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { T, S, MN, Card, Stat, IRow, PageTitle, G2, Empty, money, bizDay, dayNm } from '../shared'

export function Dash({ txs, daily }) {
  const tod = bizDay()
  const [sm, setSm] = useState(tod.slice(0, 7))

  const mTxs = useMemo(() => txs.filter(t => t.date.startsWith(sm)), [txs, sm])
  const inc   = useMemo(() => mTxs.filter(t => t.type === "income" ).reduce((s, t) => s + Number(t.amount), 0), [mTxs])
  const exp   = useMemo(() => mTxs.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0), [mTxs])

  const mDly  = useMemo(() => daily.filter(r => r.date.startsWith(sm)), [daily, sm])
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
            style={{ ...S.field, width: 130, height: 36, fontSize: 12, padding: "0 8px" }}
          />
        }
      />

      {/* ─── Today's report status ─── */}
      <div style={{
        background: todayReport ? T.gn2 : T.or2,
        border: "1px solid " + (todayReport ? "rgba(46,204,113,0.3)" : "rgba(243,156,18,0.3)"),
        borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 22 }}>{todayReport ? "✅" : "⚠️"}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.tx }}>
            {todayReport ? "דוח יומי הוגש היום" : "דוח יומי לא הוגש עדיין"}
          </div>
          {todayReport ? (
            <div style={{ fontSize: 11, color: T.tx2, marginTop: 2 }}>
              {todayReport.diners} בונים · מזומן {money(todayReport.cash || 0)} · אשראי {money(todayReport.credit || 0)}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: T.tx3, marginTop: 2 }}>לחץ על "דוח" להוספה</div>
          )}
        </div>
      </div>

      {/* ─── KPI stats ─── */}
      <G2 gap={12}>
        <Stat label="הכנסות"  val={money(inc)}       icon="📈" color={T.gn}                   bg={T.gn2} />
        <Stat label="הוצאות"  val={money(exp)}       icon="📉" color={T.rd}                   bg={T.rd2} />
        <Stat label="רווח"    val={money(inc - exp)} icon="💰" color={inc-exp >= 0 ? T.gn : T.rd} bg={inc-exp >= 0 ? T.gn2 : T.rd2} />
        <Stat label="בונים"   val={diners}           icon="🍽" color={T.or}                   bg={T.or2} />
      </G2>

      {/* ─── Last report card ─── */}
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

      {/* ─── 6-month bar chart ─── */}
      <div style={{ marginTop: 16 }}>
        <Card title="הכנסות מול הוצאות – 6 חודשים">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barGap={4} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <XAxis dataKey="name" stroke={T.tx3} tick={{ fontSize: 10, fill: T.tx2 }} />
              <YAxis stroke={T.tx3} tick={{ fontSize: 10, fill: T.tx2 }} tickFormatter={v => v > 999 ? (v/1000).toFixed(0)+"k" : v} />
              <Tooltip
                formatter={(v, n) => [money(v), n === "inc" ? "הכנסות" : "הוצאות"]}
                contentStyle={{ background: T.card2, border: "1px solid "+T.border, borderRadius: 10, color: T.tx, fontSize: 12 }}
              />
              <Bar dataKey="inc" fill={T.gn} radius={[4,4,0,0]} />
              <Bar dataKey="exp" fill={T.rd} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ─── Top expense categories ─── */}
      {topCats.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Card title="הוצאות לפי ספק">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topCats.map(([cat, amt]) => (
                <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: T.card2, borderRadius: 10, border: "1px solid "+T.border }}>
                  <span style={{ fontSize: 13, color: T.tx }}>{cat}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 60, height: 4, background: T.border, borderRadius: 2 }}>
                      <div style={{ height: "100%", width: (exp > 0 ? Math.min(amt/exp*100, 100) : 0)+"%", background: T.rd, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontWeight: 700, color: T.rd, minWidth: 60, textAlign: "left" }}>{money(amt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {txs.length === 0 && daily.length === 0 && (
        <div style={{ marginTop: 16 }}>
          <Card><Empty text="אין נתונים עדיין – הוסף דוח יומי כדי להתחיל" icon="🚀" /></Card>
        </div>
      )}
    </div>
  )
}
