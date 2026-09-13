import { useState, useMemo } from "react";
import { Plus, X, Heart, Calendar, Pin } from "lucide-react";

// ---- design tokens ----
// paper: #FBF3E7   ink: #3D2B1F   blush: #E8B4B8   plum: #4A2545   sage: #8A9B6E   gold: #C9A227
const THEMES = {
  blush: { accent: "#C97B84", tape: "#F0D9CD", label: "Blush" },
  sage: { accent: "#7C8F5E", tape: "#DCE3C8", label: "Sage" },
  plum: { accent: "#6B3F63", tape: "#E3D2DE", label: "Plum" },
};

function monthDiff(start, end) {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(months, 0);
}

function nextMilestone(start, today) {
  const months = monthDiff(start, today) + 1;
  const next = new Date(start);
  next.setMonth(next.getMonth() + months);
  const days = Math.ceil((next - today) / 86400000);
  return { months, days };
}

export default function OurStoryGenerator() {
  const [names, setNames] = useState({ a: "Mika", b: "Lian" });
  const [startDate, setStartDate] = useState("2026-03-14");
  const [theme, setTheme] = useState("blush");
  const [memories, setMemories] = useState([
    { date: "Mar 14", text: "Said yes on the rooftop, it was raining" },
    { date: "Apr 20", text: "First trip together — got lost in Cebu" },
  ]);
  const [reasons, setReasons] = useState([
    "You remember how I take my coffee",
    "You laugh at your own jokes first",
  ]);
  const [newMemory, setNewMemory] = useState("");
  const [newReason, setNewReason] = useState("");

  const t = THEMES[theme];
  const start = useMemo(() => new Date(startDate), [startDate]);
  const today = new Date();
  const totalDays = Math.max(Math.floor((today - start) / 86400000), 0);
  const months = monthDiff(start, today);
  const milestone = nextMilestone(start, today);

  function addMemory() {
    if (!newMemory.trim()) return;
    setMemories([...memories, { date: "New", text: newMemory.trim() }]);
    setNewMemory("");
  }
  function addReason() {
    if (!newReason.trim()) return;
    setReasons([...reasons, newReason.trim()]);
    setNewReason("");
  }

  return (
    <div style={{ background: "#EFE9DD", minHeight: "100%", fontFamily: "'Work Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,500&family=Caveat:wght@500;700&family=Work+Sans:wght@400;500&display=swap');
      `}</style>

      <div className="grid md:grid-cols-2 gap-0 min-h-full">
        {/* ---- LEFT: builder form ---- */}
        <div className="p-8 md:p-10" style={{ background: "#EFE9DD" }}>
          <p style={{ color: "#3D2B1F", opacity: 0.5, fontSize: "13px", letterSpacing: "0.02em" }}>
            Build your page
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif", color: "#3D2B1F", fontSize: "28px", fontWeight: 600, marginTop: "4px" }}>
            Our Story
          </h1>

          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Your name</label>
                <input value={names.a} onChange={(e) => setNames({ ...names, a: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Their name</label>
                <input value={names.b} onChange={(e) => setNames({ ...names, b: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Together since</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Color theme</label>
              <div className="flex gap-2 mt-1">
                {Object.entries(THEMES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md"
                    style={{
                      border: theme === key ? `2px solid ${val.accent}` : "1px solid #D9CFC0",
                      background: "#fff",
                    }}
                  >
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: val.accent, display: "inline-block" }} />
                    <span style={{ fontSize: "13px", color: "#3D2B1F" }}>{val.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Memories</label>
              <div className="space-y-2 mt-1">
                {memories.map((m, i) => (
                  <div key={i} className="flex items-center justify-between" style={{ fontSize: "13px", color: "#3D2B1F", background: "#fff", padding: "8px 10px", borderRadius: "6px", border: "1px solid #E3DACB" }}>
                    <span><b>{m.date}</b> — {m.text}</span>
                    <button onClick={() => setMemories(memories.filter((_, idx) => idx !== i))}>
                      <X size={14} color="#A99A84" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  placeholder="Add a memory..."
                  style={{ ...inputStyle, flex: 1 }}
                  onKeyDown={(e) => e.key === "Enter" && addMemory()}
                />
                <button onClick={addMemory} style={{ ...smallBtn, background: t.accent }}>
                  <Plus size={16} color="#fff" />
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Reasons why</label>
              <div className="space-y-2 mt-1">
                {reasons.map((r, i) => (
                  <div key={i} className="flex items-center justify-between" style={{ fontSize: "13px", color: "#3D2B1F", background: "#fff", padding: "8px 10px", borderRadius: "6px", border: "1px solid #E3DACB" }}>
                    <span>{r}</span>
                    <button onClick={() => setReasons(reasons.filter((_, idx) => idx !== i))}>
                      <X size={14} color="#A99A84" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Add a reason..."
                  style={{ ...inputStyle, flex: 1 }}
                  onKeyDown={(e) => e.key === "Enter" && addReason()}
                />
                <button onClick={addReason} style={{ ...smallBtn, background: t.accent }}>
                  <Plus size={16} color="#fff" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---- RIGHT: live scrapbook preview ---- */}
        <div className="p-6 md:p-10 flex items-start justify-center" style={{ background: "#E3DBC9" }}>
          <div
            style={{
              background: "#FBF3E7",
              width: "100%",
              maxWidth: "440px",
              borderRadius: "4px",
              boxShadow: "0 18px 40px rgba(61,43,31,0.18)",
              padding: "34px 26px 30px",
              position: "relative",
              minHeight: "560px",
            }}
          >
            {/* washi tape corner */}
            <div style={{
              position: "absolute", top: "-10px", left: "34px", width: "70px", height: "22px",
              background: t.tape, opacity: 0.85, transform: "rotate(-4deg)",
            }} />

            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "22px", color: t.accent, textAlign: "center" }}>
              {names.a} &amp; {names.b}
            </p>

            <div style={{ textAlign: "center", marginTop: "6px" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 500, fontSize: "52px", color: "#3D2B1F", lineHeight: 1 }}>
                {months}
              </div>
              <div style={{ fontSize: "13px", color: "#3D2B1F", opacity: 0.65, marginTop: "2px" }}>
                {months === 1 ? "month" : "months"} together · {totalDays} days
              </div>
              <div style={{ fontSize: "12px", color: t.accent, marginTop: "10px" }}>
                {milestone.days === 0 ? "today is your monthsary 🎉" : `${milestone.days} days to your ${ordinal(milestone.months)} monthsary`}
              </div>
            </div>

            {/* polaroids */}
            <div className="flex justify-center gap-4 mt-7" style={{ position: "relative" }}>
              {[{ rot: -6 }, { rot: 4 }].map((p, i) => (
                <div key={i} style={{
                  background: "#fff", padding: "8px 8px 20px", boxShadow: "0 6px 14px rgba(61,43,31,0.15)",
                  transform: `rotate(${p.rot}deg)`, width: "110px",
                }}>
                  <div style={{ width: "100%", height: "90px", background: `linear-gradient(135deg, ${t.accent}55, ${t.tape})` }} />
                </div>
              ))}
            </div>

            {/* memories timeline */}
            <div style={{ marginTop: "24px" }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", color: t.accent, marginBottom: "6px" }}>
                little moments
              </p>
              <div style={{ borderLeft: `2px solid ${t.tape}`, paddingLeft: "14px" }}>
                {memories.map((m, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", color: t.accent, fontWeight: 600 }}>{m.date}</div>
                    <div style={{ fontSize: "13px", color: "#3D2B1F" }}>{m.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* reasons */}
            <div style={{ marginTop: "20px" }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", color: t.accent, marginBottom: "8px" }}>
                reasons why
              </p>
              <div className="grid grid-cols-1 gap-2">
                {reasons.map((r, i) => (
                  <div key={i} style={{
                    background: "#fff", fontSize: "12.5px", color: "#3D2B1F", padding: "9px 11px",
                    boxShadow: "0 3px 8px rgba(61,43,31,0.10)", transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
                  }}>
                    {r}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <span style={{ fontSize: "10px", color: "#3D2B1F", opacity: 0.35, letterSpacing: "0.04em" }}>
                ourstory.page/{names.a.toLowerCase()}{names.b.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const labelStyle = { fontSize: "12px", color: "#3D2B1F", opacity: 0.6, display: "block", marginBottom: "4px" };
const inputStyle = {
  width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "6px",
  border: "1px solid #D9CFC0", background: "#fff", color: "#3D2B1F", outline: "none",
};
const smallBtn = { padding: "8px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" };
