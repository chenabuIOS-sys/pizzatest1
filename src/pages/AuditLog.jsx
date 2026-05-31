import { useState } from 'react'
import { T, Card, PageTitle, Empty, dtStr } from '../shared'

export function AuditLog({ lg }) {
  const [search, setSearch] = useState("")

  const filtered = search
    ? lg.filter(l => l.user.includes(search) || l.action.includes(search) || (l.details||"").includes(search))
    : lg

  return (
    <div>
      <PageTitle title="יומן פעולות" sub={lg.length + " פעולות"} />

      {lg.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <input
            value={search}
            onChange={ev => setSearch(ev.target.value)}
            placeholder="🔍  חפש..."
            style={{ background: T.card2, border: "1px solid "+T.border, borderRadius: 10, color: T.tx, outline: "none", fontFamily: "inherit", width: "100%", height: 42, padding: "0 14px", fontSize: 14 }}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <Card><Empty text={lg.length === 0 ? "אין פעולות" : "אין תוצאות לחיפוש"} icon="📋" /></Card>
      ) : (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(l => (
              <div key={l.id} style={{ padding: "12px 14px", background: T.card2, borderRadius: 10, border: "1px solid "+T.border }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: l.details ? 4 : 0 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.pr }}>{l.user}</span>
                    <span style={{ fontSize: 13, color: T.tx }}>{" · " + l.action}</span>
                  </div>
                  <span style={{ fontSize: 10, color: T.tx3, whiteSpace: "nowrap", marginRight: 8 }}>{dtStr(l.at)}</span>
                </div>
                {l.details && <div style={{ fontSize: 11, color: T.tx2 }}>{l.details}</div>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
