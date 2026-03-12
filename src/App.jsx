import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ─── FONTS & BASE ─────────────────────────────────────────────────
const SERIF = "'Libre Baskerville', 'Times New Roman', Georgia, serif";
const MONO = "'Courier New', monospace";

// ─── THEME CONTEXT ────────────────────────────────────────────────
const ThemeContext = createContext("dark");
const useTheme = () => useContext(ThemeContext);

// Theme tokens — warm earthy palette
const THEMES = {
  dark: {
    // Warm dark base — brown-black, not cold grey-black
    bg: "#0e0c0a",
    bgCard: "#141210",
    bgCardInner: "#100e0c",
    bgInput: "#141210",
    bgHover: "#1a1714",
    bgTag: "#1e1a16",
    bgHabit: "#100e0c",
    bgHabitDone: "#1a1714",
    bgBtn: "#1e1a16",
    bgBtnHover: "#262018",
    bgFormBlock: "#100e0c",
    border: "#221e18",
    borderStrong: "#2e2820",
    borderFocus: "#4a3e30",
    // Warm text tones
    textPrimary: "#e8e0d4",
    textSecondary: "#a89880",
    textMuted: "#7a6a58",
    textFaint: "#4a3e30",
    textQuote: "#7a6a58",
    textAuthor: "#4a3e30",
    textPlaceholder: "#3a3028",
    textFooter: "#2e2820",
    divider: "#1e1a14",
    progressBg: "#221e18",
    scrollbar: "#2e2820",
    colorScheme: "dark",
    // Header accent — terracotta
    accentHeader: "#c8614a",
    accentSub: "#8a6a50",
    // Section title colors — warm amber/terracotta tones per section
    sectionColors: {
      hunt: "#c8614a",  // terracotta
      intel: "#b88a50",  // amber
      learning: "#a07848",  // warm brown
      life: "#b07850",  // sandy brown
      content: "#c87848",  // burnt orange
      doors: "#9a8060",  // warm taupe
      fitness: "#a89060",  // sand
      goals: "#c86848",  // deep terracotta
    },
    statusBgs: {
      Researching: { bg: "#1e1a14", color: "#7a6a58" },
      Applied: { bg: "#101820", color: "#5a8aaa" },
      "Phone Screen": { bg: "#1e1a0e", color: "#b09040" },
      Interview: { bg: "#0e1a10", color: "#508a60" },
      Offer: { bg: "#1a1428", color: "#8060b0" },
      Rejected: { bg: "#1a100e", color: "#b05848" },
    },
  },
  light: {
    // Warm cream/parchment base
    bg: "#f5f0e8",
    bgCard: "#fdfaf4",
    bgCardInner: "#f8f4ee",
    bgInput: "#f0ece4",
    bgHover: "#ede8e0",
    bgTag: "#e8e2d8",
    bgHabit: "#f8f4ee",
    bgHabitDone: "#ede8e0",
    bgBtn: "#e8e2d8",
    bgBtnHover: "#dfd8cc",
    bgFormBlock: "#f8f4ee",
    border: "#dfd8cc",
    borderStrong: "#cec6b8",
    borderFocus: "#a89880",
    textPrimary: "#1e1810",
    textSecondary: "#4a3e2e",
    textMuted: "#7a6a50",
    textFaint: "#a09078",
    textQuote: "#6a5a40",
    textAuthor: "#a09078",
    textPlaceholder: "#c0b098",
    textFooter: "#c8b89a",
    divider: "#dfd8cc",
    progressBg: "#dfd8cc",
    scrollbar: "#cec6b8",
    colorScheme: "light",
    // Header accent — deeper terracotta for light bg
    accentHeader: "#b04830",
    accentSub: "#7a5a40",
    sectionColors: {
      hunt: "#b04830",
      intel: "#906828",
      learning: "#785830",
      life: "#885830",
      content: "#a05828",
      doors: "#706048",
      fitness: "#807048",
      goals: "#a05030",
    },
    statusBgs: {
      Researching: { bg: "#ece6dc", color: "#7a6a50" },
      Applied: { bg: "#dce8f0", color: "#305878" },
      "Phone Screen": { bg: "#f0ead8", color: "#786018" },
      Interview: { bg: "#dceee0", color: "#286840" },
      Offer: { bg: "#ece0f0", color: "#583888" },
      Rejected: { bg: "#f0dcd8", color: "#883020" },
    },
  },
};

// ─── DATA ─────────────────────────────────────────────────────────
const FALLBACK_QUOTE = { text: "The secret of getting ahead is getting started.", author: "Mark Twain" };

const SECTIONS = [
  { id: "hunt", label: "Job Applications", emoji: "💼", subtitle: "Track every application" },
  { id: "intel", label: "Company Research", emoji: "🔎", subtitle: "Notes on target companies" },
  { id: "learning", label: "Learning & Skills", emoji: "📖", subtitle: "Courses, reading, practice" },
  { id: "life", label: "Life & Admin", emoji: "📋", subtitle: "US admin, errands, setup" },
  { id: "content", label: "Content & Brand", emoji: "✍️", subtitle: "LinkedIn, Instagram ideas" },
  { id: "doors", label: "Opportunities", emoji: "🚪", subtitle: "Networking, freelance, leads" },
  { id: "fitness", label: "Health & Fitness", emoji: "⚡", subtitle: "Daily habits and body goals" },
  { id: "goals", label: "Goals & Vision", emoji: "🎯", subtitle: "Short, mid and long-term" },
];

const HUNT_STATUSES = ["Researching", "Applied", "Phone Screen", "Interview", "Offer", "Rejected"];

const FITNESS_HABITS = [
  { id: "steps", label: "10,000 Steps", icon: "👟" },
  { id: "diet", label: "Clean Diet", icon: "🥗" },
  { id: "sugar", label: "No Sugar", icon: "🚫" },
  { id: "strength", label: "Strength Training", icon: "🏋️" },
];

const GOAL_TYPES = [
  { id: "short", label: "30-Day", color: "#b07060" },
  { id: "mid", label: "3-Month", color: "#a09050" },
  { id: "long", label: "1-Year", color: "#6070b0" },
  { id: "life", label: "Lifetime", color: "#608060" },
];

// ─── STORAGE — Neon Postgres via API ──────────────────────────────
const STORE_KEY = "theboard_v4";

// Generate or retrieve a persistent user ID for this device
function getUserId() {
  let id = localStorage.getItem("theboard_user_id");
  if (!id) {
    id = "user_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("theboard_user_id", id);
  }
  return id;
}

// localStorage used only as offline cache
function loadLocalCache() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } }
function saveLocalCache(d) { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch { } }

async function loadFromDB(userId) {
  const res = await fetch(`/api/load?userId=${userId}`);
  if (!res.ok) throw new Error("Load failed");
  const { data } = await res.json();
  return data || {};
}

async function saveToDB(userId, data) {
  await fetch("/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, data }),
  });
}

// ─── CONFETTI ─────────────────────────────────────────────────────
function spawnConfetti() {
  const colors = ["#7a9ab8", "#7aaa7a", "#b8a078", "#9878b8", "#b89870"];
  for (let i = 0; i < 36; i++) {
    const el = document.createElement("div");
    const sz = Math.random() * 8 + 4;
    el.style.cssText = `position:fixed;left:${Math.random() * 100}vw;top:-20px;width:${sz}px;height:${sz}px;background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:${Math.random() > .5 ? "50%" : "2px"};pointer-events:none;z-index:9999;animation:confettiFall ${1.4 + Math.random()}s ease-in forwards;opacity:0.9;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────
function ProgressBar({ pct, color }) {
  const t = THEMES[useTheme()];
  return (
    <div style={{ margin: "10px 0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <span style={{ fontFamily: MONO, fontSize: "10px", color: t.textMuted, letterSpacing: "1px", textTransform: "uppercase" }}>Progress</span>
        <span style={{ fontFamily: MONO, fontSize: "10px", color: pct === 100 ? color : t.textMuted }}>{pct}%{pct === 100 ? " ✓" : ""}</span>
      </div>
      <div style={{ height: "2px", background: t.progressBg, borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function Divider() {
  const t = THEMES[useTheme()];
  return <div style={{ height: "1px", background: t.divider, margin: "12px 0" }} />;
}

// ─── TASK ROW ─────────────────────────────────────────────────────
function TaskRow({ item, onToggle, onDelete, onDragStart, onDragOver, onDrop, dragOver }) {
  const t = THEMES[useTheme()];
  const [hovered, setHovered] = useState(false);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: "10px",
        padding: "9px 10px", marginBottom: "3px",
        background: dragOver || hovered ? t.bgHover : "transparent",
        borderRadius: "4px", cursor: "grab", transition: "background 0.12s",
      }}
    >
      <button onClick={() => onToggle(item.id)} style={{
        width: "15px", height: "15px", minWidth: "15px", marginTop: "2px",
        border: `1px solid ${item.done ? t.borderStrong : t.borderStrong}`,
        borderRadius: "2px",
        background: item.done ? t.borderStrong : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 0, flexShrink: 0, transition: "all 0.15s",
      }}>
        {item.done && <span style={{ color: t.textMuted, fontSize: "9px", lineHeight: 1 }}>✓</span>}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontFamily: SERIF, fontSize: "13.5px",
          color: item.done ? t.textFaint : t.textSecondary,
          lineHeight: "1.55",
          textDecoration: item.done ? "line-through" : "none",
          textDecorationColor: t.textMuted,
          wordBreak: "break-word",
        }}>{item.text}</span>
        {item.tag && (
          <span style={{
            marginLeft: "8px", background: t.bgTag,
            border: `1px solid ${t.border}`, borderRadius: "3px",
            padding: "0 5px", fontSize: "10px", color: t.textMuted,
            fontFamily: MONO, verticalAlign: "middle",
          }}>{item.tag}</span>
        )}
      </div>
      <button onClick={() => onDelete(item.id)} style={{
        border: "none", background: "none", cursor: "pointer",
        color: hovered ? t.textMuted : "transparent",
        fontSize: "15px", padding: "0 2px", lineHeight: 1, flexShrink: 0,
        transition: "color 0.15s",
      }}>×</button>
    </div>
  );
}

// ─── ADD INPUT ────────────────────────────────────────────────────
function AddInput({ placeholder, onAdd, tagInput = false }) {
  const t = THEMES[useTheme()];
  const [val, setVal] = useState("");
  const [tag, setTag] = useState("");
  const submit = () => { if (!val.trim()) return; onAdd(val.trim(), tag.trim()); setVal(""); setTag(""); };

  const inputStyle = {
    background: t.bgInput, border: `1px solid ${t.border}`,
    borderRadius: "4px", outline: "none", padding: "7px 10px",
    fontFamily: SERIF, fontSize: "13px", color: t.textPrimary,
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "12px" }}>
      <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
        placeholder={placeholder} style={{ ...inputStyle, flex: 1 }}
        onFocus={e => e.target.style.borderColor = t.borderFocus}
        onBlur={e => e.target.style.borderColor = t.border} />
      {tagInput && (
        <input value={tag} onChange={e => setTag(e.target.value)} placeholder="#tag"
          style={{ ...inputStyle, width: "64px", fontFamily: MONO, fontSize: "11px", color: t.textMuted }} />
      )}
      <button onClick={submit} style={{
        background: t.bgBtn, color: t.textMuted, border: `1px solid ${t.border}`,
        borderRadius: "4px", padding: "7px 14px", cursor: "pointer",
        fontFamily: MONO, fontSize: "13px", fontWeight: "bold", transition: "all 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.background = t.bgBtnHover; e.currentTarget.style.color = t.textSecondary; }}
        onMouseLeave={e => { e.currentTarget.style.background = t.bgBtn; e.currentTarget.style.color = t.textMuted; }}
      >+</button>
    </div>
  );
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────
function Section({ section, children, itemCount, doneCount }) {
  const theme = useTheme();
  const t = THEMES[theme];
  const sectionColor = t.sectionColors[section.id];
  const pct = itemCount ? Math.round(doneCount / itemCount * 100) : 0;
  return (
    <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "6px", padding: "20px 20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>{section.emoji}</span>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: "16px", fontWeight: "700", color: sectionColor, lineHeight: 1.2 }}>{section.label}</div>
            <div style={{ fontFamily: MONO, fontSize: "10.5px", color: t.textMuted, marginTop: "3px", letterSpacing: "0.5px" }}>{section.subtitle}</div>
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: "10px", color: t.textMuted, paddingTop: "2px" }}>{doneCount}/{itemCount}</div>
      </div>
      <ProgressBar pct={pct} color={sectionColor} />
      {children}
    </div>
  );
}

// ─── GENERIC SECTION ──────────────────────────────────────────────
function GenericSection({ section, data, update }) {
  const t = THEMES[useTheme()];
  const items = data[section.id] || [];
  const active = items.filter(i => !i.done);
  const done = items.filter(i => i.done);
  const [showArchive, setShowArchive] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const add = (text, tag) => update(d => ({ ...d, [section.id]: [{ id: Date.now(), text, tag, done: false }, ...(d[section.id] || [])] }));
  const toggle = (id) => {
    if (items.find(i => i.id === id)?.done === false) spawnConfetti();
    update(d => ({ ...d, [section.id]: (d[section.id] || []).map(i => i.id === id ? { ...i, done: !i.done } : i) }));
  };
  const del = (id) => update(d => ({ ...d, [section.id]: (d[section.id] || []).filter(i => i.id !== id) }));
  const drop = () => {
    if (dragIdx === null || overIdx === null || dragIdx === overIdx) return;
    update(d => {
      const a = [...(d[section.id] || []).filter(i => !i.done)];
      const dn = (d[section.id] || []).filter(i => i.done);
      const [mv] = a.splice(dragIdx, 1); a.splice(overIdx, 0, mv);
      return { ...d, [section.id]: [...a, ...dn] };
    });
    setDragIdx(null); setOverIdx(null);
  };

  return (
    <Section section={section} itemCount={items.length} doneCount={done.length}>
      <AddInput placeholder={`Add to ${section.label}…`} onAdd={add} tagInput />
      {active.length === 0 && <div style={{ fontFamily: SERIF, fontSize: "13px", color: t.textFaint, fontStyle: "italic", padding: "8px 0" }}>Nothing added yet.</div>}
      {active.map((item, idx) => (
        <TaskRow key={item.id} item={item} onToggle={toggle} onDelete={del}
          onDragStart={() => setDragIdx(idx)} onDragOver={() => setOverIdx(idx)} onDrop={drop}
          dragOver={overIdx === idx && dragIdx !== idx} />
      ))}
      {done.length > 0 && (
        <>
          <Divider />
          <button onClick={() => setShowArchive(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: "10px", color: t.textMuted, padding: 0, letterSpacing: "0.5px" }}>
            {showArchive ? "▾" : "▸"} Archive ({done.length})
          </button>
          {showArchive && done.map(item => (
            <TaskRow key={item.id} item={item} onToggle={toggle} onDelete={del}
              onDragStart={() => { }} onDragOver={() => { }} onDrop={() => { }} dragOver={false} />
          ))}
        </>
      )}
    </Section>
  );
}

// ─── JOB HUNT ─────────────────────────────────────────────────────
function HuntSection({ data, update }) {
  const t = THEMES[useTheme()];
  const section = SECTIONS[0];
  const items = data.hunt || [];
  const active = items.filter(i => !i.done);
  const done = items.filter(i => i.done);
  const [form, setForm] = useState({ company: "", role: "", status: "Researching", notes: "", link: "" });
  const [adding, setAdding] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const add = () => {
    if (!form.company.trim()) return;
    update(d => ({ ...d, hunt: [{ id: Date.now(), ...form, done: false, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }, ...(d.hunt || [])] }));
    setForm({ company: "", role: "", status: "Researching", notes: "", link: "" }); setAdding(false);
  };
  const setStatus = (id, status) => update(d => ({ ...d, hunt: (d.hunt || []).map(i => i.id === id ? { ...i, status } : i) }));
  const toggle = (id) => {
    if (items.find(i => i.id === id)?.done === false) spawnConfetti();
    update(d => ({ ...d, hunt: (d.hunt || []).map(i => i.id === id ? { ...i, done: !i.done } : i) }));
  };
  const del = (id) => update(d => ({ ...d, hunt: (d.hunt || []).filter(i => i.id !== id) }));

  const inputBase = { display: "block", width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${t.border}`, outline: "none", fontFamily: SERIF, color: t.textPrimary, padding: "6px 0", marginBottom: "10px", boxSizing: "border-box" };

  return (
    <Section section={section} itemCount={items.length} doneCount={done.length}>
      <button onClick={() => setAdding(v => !v)} style={{
        background: adding ? "transparent" : t.bgBtn, border: `1px solid ${adding ? t.border : t.borderStrong}`,
        borderRadius: "4px", padding: "7px 14px", cursor: "pointer",
        fontFamily: MONO, fontSize: "11px", color: adding ? t.textFaint : t.textMuted,
        marginBottom: "12px", transition: "all 0.15s", letterSpacing: "0.5px",
      }}>{adding ? "✕  Cancel" : "+ New Application"}</button>

      {adding && (
        <div style={{ background: t.bgFormBlock, border: `1px solid ${t.border}`, borderRadius: "4px", padding: "14px", marginBottom: "14px" }}>
          {[{ key: "company", ph: "Company *", sz: "14px" }, { key: "role", ph: "Role / Title", sz: "13px" }, { key: "link", ph: "Job posting URL", sz: "13px" }, { key: "notes", ph: "Notes", sz: "13px" }].map(f => (
            <input key={f.key} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.ph} style={{ ...inputBase, fontSize: f.sz }} />
          ))}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              style={{ flex: 1, background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: "4px", padding: "6px 8px", fontFamily: MONO, fontSize: "11px", color: t.textMuted, outline: "none" }}>
              {HUNT_STATUSES.map(s => <option key={s} style={{ background: t.bgCard }}>{s}</option>)}
            </select>
            <button onClick={add} style={{ background: t.bgBtn, color: t.textSecondary, border: `1px solid ${t.borderStrong}`, borderRadius: "4px", padding: "6px 18px", cursor: "pointer", fontFamily: MONO, fontSize: "11px", fontWeight: "bold" }}>Add</button>
          </div>
        </div>
      )}

      {active.length === 0 && !adding && <div style={{ fontFamily: SERIF, fontSize: "13px", color: t.textFaint, fontStyle: "italic", padding: "8px 0" }}>No active applications.</div>}

      {active.map(item => (
        <div key={item.id} style={{ background: t.bgCardInner, border: `1px solid ${t.border}`, borderRadius: "4px", padding: "11px 12px", marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: "14px", fontWeight: "700", color: item.done ? t.textFaint : t.textPrimary, lineHeight: 1.3, textDecoration: item.done ? "line-through" : "none", textDecorationColor: t.textMuted }}>{item.company}</div>
              {item.role && <div style={{ fontFamily: MONO, fontSize: "11px", color: t.textMuted, marginTop: "3px" }}>{item.role}</div>}
              {item.notes && <div style={{ fontFamily: SERIF, fontSize: "12px", color: t.textMuted, fontStyle: "italic", marginTop: "4px" }}>{item.notes}</div>}
              {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={{ fontFamily: MONO, fontSize: "10px", color: "#6a9cc0", marginTop: "4px", display: "block", textDecoration: "none" }}>↗ View posting</a>}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <select value={item.status} onChange={e => setStatus(item.id, e.target.value)}
                  style={{ fontSize: "10px", border: `1px solid ${t.border}`, borderRadius: "3px", color: t.statusBgs[item.status]?.color || t.textMuted, background: t.statusBgs[item.status]?.bg || t.bgCard, fontFamily: MONO, fontWeight: "bold", padding: "2px 6px", cursor: "pointer", outline: "none" }}>
                  {HUNT_STATUSES.map(s => <option key={s} style={{ background: t.bgCard, color: t.textPrimary }}>{s}</option>)}
                </select>
                <span style={{ fontFamily: MONO, fontSize: "10px", color: t.textFaint }}>{item.date}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "flex-end" }}>
              <button onClick={() => toggle(item.id)} style={{ border: `1px solid ${t.border}`, background: "transparent", color: t.textMuted, borderRadius: "3px", padding: "3px 9px", cursor: "pointer", fontFamily: MONO, fontSize: "10px", whiteSpace: "nowrap", transition: "all 0.15s" }}
                onMouseEnter={e => { e.target.style.color = t.textSecondary; e.target.style.borderColor = t.borderStrong; }}
                onMouseLeave={e => { e.target.style.color = t.textMuted; e.target.style.borderColor = t.border; }}
              >{item.done ? "✓ Done" : "Mark done"}</button>
              <button onClick={() => del(item.id)} style={{ border: "none", background: "none", cursor: "pointer", color: t.textFaint, fontSize: "14px", padding: 0, lineHeight: 1, transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = t.textMuted} onMouseLeave={e => e.target.style.color = t.textFaint}>×</button>
            </div>
          </div>
        </div>
      ))}

      {done.length > 0 && (
        <>
          <Divider />
          <button onClick={() => setShowArchive(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: "10px", color: t.textMuted, padding: 0, letterSpacing: "0.5px" }}>
            {showArchive ? "▾" : "▸"} Archive ({done.length})
          </button>
          {showArchive && done.map(item => (
            <div key={item.id} style={{ padding: "5px 0", fontFamily: SERIF, fontSize: "12px", color: t.textFaint, textDecoration: "line-through", display: "flex", justifyContent: "space-between" }}>
              <span>{item.company}{item.role ? ` — ${item.role}` : ""}</span>
              <button onClick={() => del(item.id)} style={{ border: "none", background: "none", cursor: "pointer", color: t.textFaint, fontSize: "12px" }}>×</button>
            </div>
          ))}
        </>
      )}
    </Section>
  );
}

// ─── FITNESS ──────────────────────────────────────────────────────
function FitnessSection({ data, update }) {
  const t = THEMES[useTheme()];
  const section = SECTIONS.find(s => s.id === "fitness");
  const today = new Date().toDateString();
  const todayData = (data.fitness || {})[today] || { habits: {}, note: "" };
  const checked = FITNESS_HABITS.filter(h => todayData.habits[h.id]).length;
  const tasks = data.fitness_tasks || [];
  const doneTasks = tasks.filter(i => i.done);

  const toggleHabit = (id) => {
    if (!todayData.habits[id]) spawnConfetti();
    update(d => ({ ...d, fitness: { ...(d.fitness || {}), [today]: { ...todayData, habits: { ...todayData.habits, [id]: !todayData.habits[id] } } } }));
  };
  const setNote = (note) => update(d => ({ ...d, fitness: { ...(d.fitness || {}), [today]: { ...todayData, note } } }));
  const addTask = (text) => update(d => ({ ...d, fitness_tasks: [{ id: Date.now(), text, done: false }, ...(d.fitness_tasks || [])] }));
  const toggleTask = (id) => {
    if (tasks.find(i => i.id === id)?.done === false) spawnConfetti();
    update(d => ({ ...d, fitness_tasks: (d.fitness_tasks || []).map(i => i.id === id ? { ...i, done: !i.done } : i) }));
  };
  const delTask = (id) => update(d => ({ ...d, fitness_tasks: (d.fitness_tasks || []).filter(i => i.id !== id) }));

  return (
    <Section section={section} itemCount={FITNESS_HABITS.length + tasks.length} doneCount={checked + doneTasks.length}>
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontFamily: MONO, fontSize: "10px", color: t.textMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Today's Habits</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          {FITNESS_HABITS.map(h => (
            <button key={h.id} onClick={() => toggleHabit(h.id)} style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "9px 11px",
              border: `1px solid ${todayData.habits[h.id] ? t.borderStrong : t.border}`,
              borderRadius: "4px", cursor: "pointer", textAlign: "left",
              background: todayData.habits[h.id] ? t.bgHabitDone : t.bgHabit,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "14px" }}>{h.icon}</span>
              <span style={{ fontFamily: SERIF, fontSize: "12.5px", color: todayData.habits[h.id] ? t.textFaint : t.textSecondary, textDecoration: todayData.habits[h.id] ? "line-through" : "none", textDecorationColor: t.textMuted, flex: 1 }}>{h.label}</span>
              {todayData.habits[h.id] && <span style={{ color: t.textMuted, fontSize: "10px" }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
      <textarea value={todayData.note} onChange={e => setNote(e.target.value)}
        placeholder="How did your body feel today? Any notes…"
        style={{ width: "100%", minHeight: "56px", background: t.bgCardInner, border: `1px solid ${t.border}`, borderRadius: "4px", fontFamily: SERIF, fontSize: "13px", color: t.textSecondary, padding: "9px 10px", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "12px", lineHeight: "1.6" }} />
      <Divider />
      <div style={{ fontFamily: MONO, fontSize: "10px", color: t.textMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Goals & Targets</div>
      <AddInput placeholder="Add a fitness goal…" onAdd={addTask} />
      {tasks.filter(i => !i.done).map(item => (
        <TaskRow key={item.id} item={item} onToggle={toggleTask} onDelete={delTask}
          onDragStart={() => { }} onDragOver={() => { }} onDrop={() => { }} dragOver={false} />
      ))}
    </Section>
  );
}

// ─── GOALS ────────────────────────────────────────────────────────
function GoalsSection({ data, update }) {
  const t = THEMES[useTheme()];
  const section = SECTIONS.find(s => s.id === "goals");
  const goals = data.goals_list || [];
  const active = goals.filter(i => !i.done);
  const done = goals.filter(i => i.done);
  const [type, setType] = useState("short");

  const add = (text) => update(d => ({ ...d, goals_list: [{ id: Date.now(), text, type, done: false }, ...(d.goals_list || [])] }));
  const toggle = (id) => {
    if (goals.find(i => i.id === id)?.done === false) spawnConfetti();
    update(d => ({ ...d, goals_list: (d.goals_list || []).map(i => i.id === id ? { ...i, done: !i.done } : i) }));
  };
  const del = (id) => update(d => ({ ...d, goals_list: (d.goals_list || []).filter(i => i.id !== id) }));

  return (
    <Section section={section} itemCount={goals.length} doneCount={done.length}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
        {GOAL_TYPES.map(gt => (
          <button key={gt.id} onClick={() => setType(gt.id)} style={{
            border: `1px solid ${type === gt.id ? gt.color : t.border}`, borderRadius: "3px",
            padding: "4px 11px", cursor: "pointer",
            background: type === gt.id ? t.bgBtn : "transparent",
            color: type === gt.id ? gt.color : t.textMuted,
            fontFamily: MONO, fontSize: "10px", transition: "all 0.15s", letterSpacing: "0.5px",
          }}>{gt.label}</button>
        ))}
      </div>
      <AddInput placeholder="Write your goal…" onAdd={add} />
      {active.length === 0 && <div style={{ fontFamily: SERIF, fontSize: "13px", color: t.textFaint, fontStyle: "italic", padding: "8px 0" }}>No goals added yet.</div>}
      {GOAL_TYPES.map(gt => {
        const tItems = active.filter(i => i.type === gt.id);
        if (!tItems.length) return null;
        return (
          <div key={gt.id} style={{ marginBottom: "12px" }}>
            <div style={{ fontFamily: MONO, fontSize: "10px", color: gt.color, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px", opacity: 0.8 }}>{gt.label}</div>
            {tItems.map(item => (
              <TaskRow key={item.id} item={item} onToggle={toggle} onDelete={del}
                onDragStart={() => { }} onDragOver={() => { }} onDrop={() => { }} dragOver={false} />
            ))}
          </div>
        );
      })}
    </Section>
  );
}

// ─── DAILY QUOTE ──────────────────────────────────────────────────
function DailyQuote() {
  const t = THEMES[useTheme()];
  const getTodayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
  const [quote, setQuote] = useState(() => {
    try {
      const c = JSON.parse(localStorage.getItem("zenquote_cache") || "{}");
      if (c.dateKey === getTodayKey() && c.quote?.text) return c.quote;
    } catch { }
    return FALLBACK_QUOTE;
  });

  useEffect(() => {
    const key = getTodayKey();
    try {
      const c = JSON.parse(localStorage.getItem("zenquote_cache") || "{}");
      if (c.dateKey === key && c.quote?.text) return;
    } catch { }
    fetch("/api/quote")
      .then(r => r.json())
      .then(d => { if (d?.[0]?.q) { const q = { text: d[0].q, author: d[0].a }; setQuote(q); localStorage.setItem("zenquote_cache", JSON.stringify({ dateKey: key, quote: q })); } })
      .catch(() => { });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "12px" }}>
      <span style={{ fontFamily: SERIF, fontSize: "13px", fontStyle: "italic", color: t.textQuote }}>"{quote.text}"</span>
      <span style={{ fontFamily: SERIF, fontSize: "11px", color: t.textAuthor, marginLeft: "8px" }}>— {quote.author}</span>
    </div>
  );
}

// ─── SETTINGS PANEL ───────────────────────────────────────────────
function SettingsPanel({ onClose, theme }) {
  const t = THEMES[theme];
  const currentId = getUserId();
  const [inputId, setInputId] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const copyId = () => {
    navigator.clipboard.writeText(currentId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const applyId = () => {
    const trimmed = inputId.trim();
    if (!trimmed.startsWith("user_")) {
      setError("Invalid ID — must start with user_");
      return;
    }
    localStorage.setItem("theboard_user_id", trimmed);
    setSaved(true);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }} onClick={onClose}>
      <div style={{
        background: t.bgCard, border: `1px solid ${t.borderStrong}`,
        borderRadius: "8px", padding: "28px", width: "100%", maxWidth: "420px",
        position: "relative",
      }} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: "18px", lineHeight: 1 }}>×</button>

        <div style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: "700", color: t.textPrimary, marginBottom: "6px" }}>Sync Settings</div>
        <div style={{ fontFamily: MONO, fontSize: "10px", color: t.textMuted, marginBottom: "24px", letterSpacing: "0.5px" }}>Use the same ID across all your devices to keep data in sync</div>

        {/* Current ID */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontFamily: MONO, fontSize: "10px", color: t.textMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Your Device ID</div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{
              flex: 1, background: t.bgCardInner, border: `1px solid ${t.border}`,
              borderRadius: "4px", padding: "9px 12px",
              fontFamily: MONO, fontSize: "11px", color: t.textSecondary,
              wordBreak: "break-all", lineHeight: "1.5",
            }}>{currentId}</div>
            <button onClick={copyId} style={{
              background: t.bgBtn, border: `1px solid ${t.border}`,
              borderRadius: "4px", padding: "9px 14px", cursor: "pointer",
              fontFamily: MONO, fontSize: "11px", color: copied ? t.accentHeader : t.textMuted,
              whiteSpace: "nowrap", transition: "all 0.15s", flexShrink: 0,
            }}>{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          <div style={{ fontFamily: MONO, fontSize: "10px", color: t.textMuted, marginTop: "8px" }}>
            Copy this ID → paste it on your other device below
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: t.divider, marginBottom: "24px" }} />

        {/* Paste ID from another device */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: "10px", color: t.textMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Paste ID from another device</div>
          <input
            value={inputId}
            onChange={e => { setInputId(e.target.value); setError(""); }}
            placeholder="user_abc123..."
            style={{
              width: "100%", background: t.bgInput, border: `1px solid ${t.border}`,
              borderRadius: "4px", outline: "none", padding: "9px 12px",
              fontFamily: MONO, fontSize: "12px", color: t.textPrimary,
              boxSizing: "border-box", marginBottom: "8px",
              transition: "border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = t.borderFocus}
            onBlur={e => e.target.style.borderColor = t.border}
          />
          {error && <div style={{ fontFamily: MONO, fontSize: "10px", color: "#c06060", marginBottom: "8px" }}>{error}</div>}
          {saved && <div style={{ fontFamily: MONO, fontSize: "10px", color: "#60a060", marginBottom: "8px" }}>✓ Saved! Reloading…</div>}
          <button onClick={applyId} style={{
            width: "100%", background: t.accentHeader, color: "#fff",
            border: "none", borderRadius: "4px", padding: "10px",
            cursor: "pointer", fontFamily: MONO, fontSize: "12px",
            fontWeight: "bold", letterSpacing: "0.5px",
            opacity: inputId.trim() ? 1 : 0.4,
            transition: "opacity 0.15s",
          }}>Apply ID & Sync</button>
        </div>
      </div>
    </div>
  );
}

// ─── THEME TOGGLE ─────────────────────────────────────────────────
function ThemeToggle({ theme, setTheme }) {
  const t = THEMES[theme];
  return (
    <button
      onClick={() => setTheme(th => th === "dark" ? "light" : "dark")}
      title="Toggle light / dark"
      style={{
        background: t.bgBtn, border: `1px solid ${t.border}`,
        borderRadius: "20px", padding: "5px 12px",
        cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
        fontFamily: MONO, fontSize: "11px", color: t.textMuted,
        transition: "all 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = t.borderStrong}
      onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
    >
      {theme === "dark" ? "☀ Light" : "◑ Dark"}
    </button>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────
export default function TheBoard() {
  const [data, setData] = useState(loadLocalCache);
  const [theme, setTheme] = useState(() => localStorage.getItem("theboard_theme") || "dark");
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const userId = getUserId();

  // Load from DB on mount — replaces local cache with latest
  useEffect(() => {
    loadFromDB(userId)
      .then(dbData => {
        setData(dbData);
        saveLocalCache(dbData);
        setSynced(true);
      })
      .catch(() => {
        // Offline — use local cache silently, still works
        setSynced(true);
      });
  }, []);

  // Debounced save — waits 1.5s after last change before hitting DB
  const saveTimer = useCallback(
    (() => {
      let timer;
      return (d) => {
        clearTimeout(timer);
        setSyncing(true);
        timer = setTimeout(() => {
          saveToDB(userId, d)
            .catch(() => { }) // silent fail — local cache still has it
            .finally(() => setSyncing(false));
        }, 1500);
      };
    })(),
    [userId]
  );

  const update = useCallback(fn => {
    setData(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      saveLocalCache(next); // instant local save
      saveTimer(next);      // async DB save
      return next;
    });
  }, [saveTimer]);

  // Persist theme
  useEffect(() => { localStorage.setItem("theboard_theme", theme); }, [theme]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      @keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
      *{box-sizing:border-box}
      body{margin:0}
      input::placeholder,textarea::placeholder{opacity:1}
      ::-webkit-scrollbar{width:4px}
    `;
    document.head.appendChild(style);
  }, []);

  const t = THEMES[theme];
  const regularSections = SECTIONS.filter(s => !["hunt", "fitness", "goals"].includes(s.id));

  // Update scrollbar and body bg dynamically
  useEffect(() => {
    document.body.style.background = t.bg;
    const el = document.getElementById("dynamic-scroll");
    if (el) { el.textContent = `::-webkit-scrollbar-track{background:${t.bg}} ::-webkit-scrollbar-thumb{background:${t.scrollbar};border-radius:2px} input,textarea,select{color-scheme:${t.colorScheme}} input::placeholder,textarea::placeholder{color:${t.textPlaceholder}}`; }
    else {
      const s = document.createElement("style"); s.id = "dynamic-scroll";
      s.textContent = `::-webkit-scrollbar-track{background:${t.bg}} ::-webkit-scrollbar-thumb{background:${t.scrollbar};border-radius:2px} input,textarea,select{color-scheme:${t.colorScheme}} input::placeholder,textarea::placeholder{color:${t.textPlaceholder}}`;
      document.head.appendChild(s);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ minHeight: "100vh", background: t.bg, padding: "32px 24px 80px", fontFamily: SERIF, transition: "background 0.2s" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>

          {/* Settings panel */}
          {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} theme={theme} />}

          {/* Header */}
          <div style={{ marginBottom: "32px", borderBottom: `1px solid ${t.divider}`, paddingBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: "28px", fontWeight: "700", color: t.accentHeader, lineHeight: 1 }}>The Board</div>
                <div style={{ fontFamily: MONO, fontSize: "10px", color: t.accentSub, marginTop: "6px", letterSpacing: "2px", textTransform: "uppercase" }}>Personal Life Planner</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                  {/* Settings button */}
                  <button onClick={() => setShowSettings(true)} style={{
                    background: t.bgBtn, border: `1px solid ${t.border}`,
                    borderRadius: "20px", padding: "5px 12px",
                    cursor: "pointer", fontFamily: MONO, fontSize: "11px", color: t.textMuted,
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = t.borderStrong}
                    onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
                  >⚙ Sync</button>
                </div>
                <div style={{ fontFamily: MONO, fontSize: "10px", color: t.textMuted }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                </div>
                <div style={{ fontFamily: MONO, fontSize: "9px", color: syncing ? t.accentSub : synced ? t.textFaint : t.textFaint, letterSpacing: "0.5px" }}>
                  {syncing ? "⟳ Saving…" : synced ? "✓ Synced" : "○ Loading…"}
                </div>
              </div>
            </div>
            <DailyQuote />
          </div>

          {/* Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <HuntSection data={data} update={update} />
            {regularSections.map(section => (
              <GenericSection key={section.id} section={section} data={data} update={update} />
            ))}
            <FitnessSection data={data} update={update} />
            <GoalsSection data={data} update={update} />
          </div>

          <div style={{ textAlign: "center", fontFamily: MONO, fontSize: "10px", color: t.textFooter, marginTop: "32px", letterSpacing: "1px" }}>
            AUTO-SAVED · DRAG TO REORDER · TICK TO ARCHIVE
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}