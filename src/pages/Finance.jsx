import { useState, useMemo } from 'react'
import { T, S, ECATS, ICATS, Card, Stat, Inp, Sel, G2, Btn, Tag, useToast, PageTitle, Empty, useLS, now, money, bizDay, tooOld } from '../shared'

export function Finance({ txs, sTxs, cu, addLog }) {
  const [lockedMonths]  = useLS("biz_locked", [])
  const [extraExpCats, setExtraExpCats] = useLS("biz_cec", [])
  const [extraIncCats, setExtraIncCats] = useLS("biz_cic", [])

  const expCats = useMemo(() => ECATS.concat(extraExpCats), [extraExpCats])
  const incCats = useMemo(() => ICATS.concat(extraIncCats), [extraIncCats])

  const [form, setForm] = useState({ type: "expense", category: ECATS[0], amount: "", description: "", date: bizDay() })
  const [filter, setFilter] = useState({ type: "all", month: "", cat: "all", search: "" })
  const [newCat, setNewCat] = useState("")
  const [showAddCat, setShowAddCat] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const { show, Toast } = useToast()

  const canEdit = cu.role === "admin" || cu.role === "achmash"
  const activeCats = form.type === "income" ? incCats : expCats

  function submit() {
    if (lockedMonths.includes(form.date.slice(0, 7))) { show("🔒 חודש זה נעול", false); return }
    if (tooOld(form.date, cu.role)) { show("לא ניתן להוסיף לתאריך ישן", false); return }
    if (!form.amount || Number(form.amount) <= 0) { show("הכנס סכום תקין", false); return }
    const entry = { id: Date.now(), ...form, amount: Number(form.amount), addedBy: cu.name, addedAt: now() }
    sTxs(p => [entry, ...p])
    addLog("הוספת עסקה", (form.type === "income" ? "הכנסה" : "הוצאה") + " " + form.category, cu)
    show(money(form.amount) + " נרשם!")
    setForm(f => ({ ...f, amount: "", description: "" }))
  }

  function saveEdit() {
    if (!editForm.amount || Number(editForm.amount) <= 0) { show("סכום לא תקין", false); return }
    sTxs(p => p.map(x => x.id === editId ? { ...x, ...editForm, amount: Number(editForm.amount), editedBy: cu.name } : x))
    addLog("עריכת עסקה", money(editForm.amount), cu)
    show("עודכן!")
    setEditId(null)
  }

  function addCategory() {
    const trimmed = newCat.trim()
    if (!trimmed) return
    if (activeCats.includes(trimmed)) { show("קטגוריה כבר קיימת", false); return }
    form.type === "income" ? setExtraIncCats(p => [...p, trimmed]) : setExtraExpCats(p => [...p, trimmed])
    setForm(f => ({ ...f, category: trimmed }))
    setNewCat("")
    setShowAddCat(false)
    show("קטגוריה נוספה!")
  }

  const filtered = useMemo(() => txs.filter(tx => {
    if (tx.fromDaily) return false
    if (filter.type !== "all" && tx.type !== filter.type) return false
    if (filter.month && !tx.date.startsWith(filter.month)) return false
    if (filter.cat !== "all" && tx.category !== filter.cat) return false
    if (filter.search) {
      const q = filter.search.toLowerCase()
      if (!tx.category.toLowerCase().includes(q) && !(tx.description||"").toLowerCase().includes(q)) return false
    }
    return true
  }), [txs, filter])

  const totalInc = useMemo(() => filtered.filter(t => t.type === "income" ).reduce((s, t) => s + t.amount, 0), [filtered])
  const totalExp = useMemo(() => filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [filtered])

  const allCats = useMemo(() => [...new Set([...ECATS, ...extraExpCats, ...ICATS, ...extraIncCats])], [extraExpCats, extraIncCats])

  return (
    <div>
      {Toast}
      <PageTitle title="פיננסי" />

      <G2 gap={12}>
        <Stat label="הכנסות" val={money(totalInc)} icon="📈" color={T.gn} bg={T.gn2} />
        <Stat label="הוצאות" val={money(totalExp)} icon="📉" color={T.rd} bg={T.rd2} />
        <Stat label="מאזן"   val={money(totalInc - totalExp)} icon="⚖️" color={totalInc-totalExp >= 0 ? T.gn : T.rd} bg={totalInc-totalExp >= 0 ? T.gn2 : T.rd2} />
        <div />
      </G2>

      {/* ─── Add transaction ─── */}
      <div style={{ marginTop: 20 }}>
        <Card title="עסקה חדשה">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <G2>
              <Sel
                label="סוג"
                val={form.type}
                onChange={v => setForm(f => ({ ...f, type: v, category: v === "income" ? incCats[0] : expCats[0] }))}
                options={[{ v: "expense", l: "📉 הוצאה" }, { v: "income", l: "📈 הכנסה" }]}
              />
              {/* Category + add button */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, color: T.tx2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>קטגוריה</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={form.category}
                    onChange={ev => setForm(f => ({ ...f, category: ev.target.value }))}
                    style={{ ...S.field, appearance: "none", flex: 1 }}
                  >
                    {activeCats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button
                    onClick={() => setShowAddCat(v => !v)}
                    style={{ ...S.btn, width: 46, height: 46, padding: 0, flexShrink: 0, background: showAddCat ? T.pr : T.card2, boxShadow: "none", border: "1px solid "+T.border, color: showAddCat ? "#fff" : T.tx2 }}
                  >
                    +
                  </button>
                </div>
              </div>
            </G2>

            {showAddCat && (
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Inp label="קטגוריה חדשה" val={newCat} onChange={setNewCat} onEnter={addCategory} ph="שם הקטגוריה..." />
                </div>
                <Btn onClick={addCategory} s={{ alignSelf: "flex-end" }}>הוסף</Btn>
              </div>
            )}

            <G2>
              <Inp label="סכום"  val={form.amount}      onChange={v => setForm(f => ({ ...f, amount: v }))}      type="number" ph="0" />
              <Inp label="תאריך" val={form.date}        onChange={v => setForm(f => ({ ...f, date: v }))}        type="date" />
            </G2>
            <Inp label="תיאור" val={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} ph="תיאור אופציונלי" />

            {cu.role !== "admin" && (
              <div style={{ fontSize: 12, color: T.tx2, background: T.card2, padding: "10px 14px", borderRadius: 10, border: "1px solid "+T.border }}>
                🔒 אחמש: ניתן להוסיף להיום או יום אחד אחורה בלבד
              </div>
            )}

            <Btn onClick={submit} s={{ width: "100%" }}>הוסף עסקה</Btn>
          </div>
        </Card>
      </div>

      {/* ─── Filters ─── */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.tx }}>עסקאות ({filtered.length})</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: T.tx3, fontSize: 16, pointerEvents: "none" }}>🔍</span>
            <input
              value={filter.search}
              onChange={ev => setFilter(f => ({ ...f, search: ev.target.value }))}
              placeholder="חפש לפי קטגוריה או תיאור..."
              style={{ ...S.field, paddingRight: 40 }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={filter.type}
              onChange={ev => setFilter(f => ({ ...f, type: ev.target.value }))}
              style={{ ...S.field, width: "auto", flex: 1, height: 36, fontSize: 12, padding: "0 8px" }}
            >
              <option value="all">הכל</option>
              <option value="income">הכנסות</option>
              <option value="expense">הוצאות</option>
            </select>
            <select
              value={filter.cat}
              onChange={ev => setFilter(f => ({ ...f, cat: ev.target.value }))}
              style={{ ...S.field, width: "auto", flex: 1, height: 36, fontSize: 12, padding: "0 8px" }}
            >
              <option value="all">כל הקטגוריות</option>
              {allCats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <input
            type="month"
            value={filter.month}
            onChange={ev => setFilter(f => ({ ...f, month: ev.target.value }))}
            style={{ ...S.field, height: 36, fontSize: 12, padding: "0 8px" }}
          />
        </div>

        {/* Transaction list */}
        {filtered.length === 0 ? (
          <Card><Empty text="אין עסקאות התואמות את הסינון" icon="💳" /></Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(tx => {
              const isEditing = editId === tx.id
              return (
                <div key={tx.id} style={{ background: T.card, borderRadius: 14, border: "1px solid "+(isEditing ? T.pr : T.border), boxShadow: T.sh, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <Tag color={tx.type === "income" ? T.gn : T.rd} bg={tx.type === "income" ? T.gn2 : T.rd2}>
                          {tx.type === "income" ? "הכנסה" : "הוצאה"}
                        </Tag>
                        <span style={{ fontWeight: 700, fontSize: 14, color: T.tx }}>{tx.category}</span>
                      </div>
                      {tx.description && <div style={{ fontSize: 12, color: T.tx2, marginBottom: 2 }}>{tx.description}</div>}
                      <div style={{ fontSize: 11, color: T.tx3 }}>
                        {tx.date} · {tx.addedBy}{tx.editedBy ? " · ✏️ "+tx.editedBy : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0, marginRight: 12 }}>
                      <span style={{ fontWeight: 800, fontSize: 17, color: tx.type === "income" ? T.gn : T.rd }}>
                        {money(tx.amount)}
                      </span>
                      {canEdit && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => {
                              if (isEditing) { setEditId(null) }
                              else { setEditId(tx.id); setEditForm({ amount: String(tx.amount), description: tx.description||"", date: tx.date }) }
                            }}
                            style={{ ...S.btnSm, color: isEditing ? T.pr : T.tx2, borderColor: isEditing ? T.pr : T.border }}
                          >
                            {isEditing ? "✕" : "✏️"}
                          </button>
                          <button
                            onClick={() => { sTxs(p => p.filter(x => x.id !== tx.id)); show("נמחק!") }}
                            style={{ ...S.btnSm, color: T.rd, borderColor: "rgba(231,76,60,0.4)" }}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div style={{ background: T.card2, borderTop: "1px solid "+T.border, padding: "14px 16px" }}>
                      <G2>
                        <Inp label="סכום"  val={editForm.amount}      onChange={v => setEditForm(f => ({ ...f, amount: v }))}      type="number" />
                        <Inp label="תאריך" val={editForm.date}        onChange={v => setEditForm(f => ({ ...f, date: v }))}        type="date" />
                        <div style={{ gridColumn: "1/-1" }}>
                          <Inp label="תיאור" val={editForm.description} onChange={v => setEditForm(f => ({ ...f, description: v }))} />
                        </div>
                      </G2>
                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <Btn onClick={saveEdit} s={{ flex: 1, height: 40, fontSize: 13 }}>שמור</Btn>
                        <button onClick={() => setEditId(null)} style={{ ...S.btnSm, flex: 1, height: 40, justifyContent: "center" }}>ביטול</button>
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
