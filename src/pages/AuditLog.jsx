import { useState } from 'react'
import { T, S, Card, PageTitle, Empty, dtStr } from '../shared'

export function AuditLog({ lg }) {
  const [search, setSearch] = useState("")

  const filtered = search
    ? lg.filter(l => l.user.includes(search) || l.action.includes(search) || (l.details||"").includes(search))
    : lg

  return (
    <div>
      <PageTitle title="יומן פעולות" sub={lg.length + " פעולות"} />

      {lg.length > 0 && (
        <div style={{ marginBottom: 16, position: "relative" }}>
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: T.tx3, fontSize: 16, pointerEvents: "none" }}>🔍</span>
          <input
            value={search}
            onChange={ev => setSearch(ev.target.value)}
            placeholder="חפש לפי משתמש, פעולה..."
            style={{
              ...S.field, paddingRight: 44,
            }}
            onFocus={ev => { ev.target.style.borderColor = T.pr; ev.target.style.boxShadow = "0 0 0 3px rgba(230,57,70,0.15)" }}
            onBlur={ev => { ev.target.style.borderColor = T.border; ev.target.style.boxShadow = "none" }}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <Card><Empty text={lg.length === 0 ? "אין פעולות ביומן" : "אין תוצאות לחיפוש"} icon="📋" /></Card>
      ) : (
        <Card p={14}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map(l => (
              <div key={l.id} style={{
                padding: "12px 14px",
                background: T.card2,
                borderRadius: 12,
                border: "1px solid " + T.border,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.pr }}>{l.user}</span>
                      <span style={{ fontSize: 10, color: T.tx3 }}>·</span>
                      <span style={{ fontSize: 13, color: T.tx, fontWeight: 500 }}>{l.action}</span>
                    </div>
                    {l.details && (
                      <div style={{ fontSize: 11, color: T.tx2, marginTop: 3 }}>{l.details}</div>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: T.tx3, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {dtStr(l.at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
