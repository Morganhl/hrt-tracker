import { useState, useEffect, useRef } from "react";

<<<<<<< HEAD
// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL      = "https://qwafwokfrakhlqqbuesv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3YWZ3b2tmcmFraGxxcWJ1ZXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzY0MjMsImV4cCI6MjA5NDkxMjQyM30.iSp5d-EQC0bRE8JazvdnMEGfHz6v7FxgHsL8foYtzOg";
const VAPID_PUBLIC_KEY  = "BNbly2PMHy9CMehr0BFOQ77AtrQeVZDcmjUi8JQMhuj-f8K4SZ1BuPVRB_BTzvmgcoCHJU6usRbyjSLV7yGed3E";

// ─── Supabase helpers ─────────────────────────────────────────────────────────
const SB_HEADERS = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" };

async function sbGet(userId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/hrt_data?user_id=eq.${encodeURIComponent(userId)}&select=data`, { headers: SB_HEADERS });
  const rows = await res.json();
  return rows?.[0]?.data || null;
}
async function sbUpsert(userId, data) {
  await fetch(`${SUPABASE_URL}/rest/v1/hrt_data`, {
    method: "POST", headers: { ...SB_HEADERS, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ user_id: userId, data, updated_at: new Date().toISOString() })
  });
}
async function sbSavePushSub(userId, subscription) {
  await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
    method: "POST", headers: { ...SB_HEADERS, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ user_id: userId, subscription })
  });
}
async function sbDeletePushSub(endpoint) {
  await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?subscription->>endpoint=eq.${encodeURIComponent(endpoint)}`, {
    method: "DELETE", headers: SB_HEADERS
  });
}

// ─── Push notification helpers ────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function subscribeToPush(userId) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) { await sbSavePushSub(userId, existing.toJSON()); return true; }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    await sbSavePushSub(userId, sub.toJSON());
    return true;
  } catch(e) { console.error("Push subscribe failed:", e); return false; }
}

async function unsubscribeFromPush() {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) { await sbDeletePushSub(sub.endpoint); await sub.unsubscribe(); }
}
=======
// ─── Supabase config ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://qwafwokfrakhlqqbuesv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3YWZ3b2tmcmFraGxxcWJ1ZXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzY0MjMsImV4cCI6MjA5NDkxMjQyM30.iSp5d-EQC0bRE8JazvdnMEGfHz6v7FxgHsL8foYtzOg";

async function sbGet(userId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/hrt_data?user_id=eq.${encodeURIComponent(userId)}&select=data`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const rows = await res.json();
  return rows?.[0]?.data || null;
}

async function sbUpsert(userId, data) {
  await fetch(`${SUPABASE_URL}/rest/v1/hrt_data`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify({ user_id: userId, data, updated_at: new Date().toISOString() })
  });
}
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c

// ─── Patch definitions ────────────────────────────────────────────────────────
const PATCH_CHANGE_DAYS = [0, 3, 7, 10, 14, 17, 21, 24];
const PATCHES = [
<<<<<<< HEAD
  { num:1, patch:"Evorel 50",    type:"oestrogen only",           week:1, color:"#D4A5A5", emoji:"🌸" },
  { num:2, patch:"Evorel 50",    type:"oestrogen only",           week:1, color:"#D4A5A5", emoji:"🌸" },
  { num:3, patch:"Evorel 50",    type:"oestrogen only",           week:2, color:"#D4A5A5", emoji:"🌸" },
  { num:4, patch:"Evorel 50",    type:"oestrogen only",           week:2, color:"#D4A5A5", emoji:"🌸" },
  { num:5, patch:"Evorel Conti", type:"oestrogen + progesterone", week:3, color:"#A5B8A5", emoji:"🌿" },
  { num:6, patch:"Evorel Conti", type:"oestrogen + progesterone", week:3, color:"#A5B8A5", emoji:"🌿" },
  { num:7, patch:"Evorel Conti", type:"oestrogen + progesterone", week:4, color:"#A5B8A5", emoji:"🌿" },
  { num:8, patch:"Evorel Conti", type:"oestrogen + progesterone", week:4, color:"#A5B8A5", emoji:"🌿" },
];
=======
  { num: 1, patch: "Evorel 50",    type: "oestrogen only",              week: 1, color: "#D4A5A5", emoji: "🌸" },
  { num: 2, patch: "Evorel 50",    type: "oestrogen only",              week: 1, color: "#D4A5A5", emoji: "🌸" },
  { num: 3, patch: "Evorel 50",    type: "oestrogen only",              week: 2, color: "#D4A5A5", emoji: "🌸" },
  { num: 4, patch: "Evorel 50",    type: "oestrogen only",              week: 2, color: "#D4A5A5", emoji: "🌸" },
  { num: 5, patch: "Evorel Conti", type: "oestrogen + progesterone",    week: 3, color: "#A5B8A5", emoji: "🌿" },
  { num: 6, patch: "Evorel Conti", type: "oestrogen + progesterone",    week: 3, color: "#A5B8A5", emoji: "🌿" },
  { num: 7, patch: "Evorel Conti", type: "oestrogen + progesterone",    week: 4, color: "#A5B8A5", emoji: "🌿" },
  { num: 8, patch: "Evorel Conti", type: "oestrogen + progesterone",    week: 4, color: "#A5B8A5", emoji: "🌿" },
];

>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatDate(d) { return d.toISOString().split("T")[0]; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function isSameDay(a, b) { return formatDate(a) === formatDate(b); }
<<<<<<< HEAD
function calcCycleStart(patchNum, appliedDate) { return addDays(appliedDate, -PATCH_CHANGE_DAYS[patchNum - 1]); }
function getActivePatch(cycleStartDate) {
  const today = new Date();
  const cycleDay = ((Math.floor((today - cycleStartDate) / 86400000) % 28) + 28) % 28;
=======

function calcCycleStart(patchNum, appliedDate) {
  return addDays(appliedDate, -PATCH_CHANGE_DAYS[patchNum - 1]);
}
function getActivePatch(cycleStartDate) {
  const today = new Date();
  const daysSince = Math.floor((today - cycleStartDate) / 86400000);
  const cycleDay  = ((daysSince % 28) + 28) % 28;
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
  let slot = 0;
  for (let i = PATCH_CHANGE_DAYS.length - 1; i >= 0; i--) { if (cycleDay >= PATCH_CHANGE_DAYS[i]) { slot = i; break; } }
  return { patch: PATCHES[slot], cycleDay, slot };
}
function generatePatchSchedule(cycleStartDate, numCycles = 6) {
  const events = [];
  for (let c = 0; c < numCycles; c++) {
<<<<<<< HEAD
    PATCHES.forEach((p, i) => events.push({
      id: `patch-${c}-${p.num}`, type:"patch", date: addDays(cycleStartDate, c*28 + PATCH_CHANGE_DAYS[i]),
      patch:p.patch, patchType:p.type, color:p.color, emoji:p.emoji, week:p.week, patchNum:p.num, cycleNum:c+1, label:`Change to ${p.patch}`
    }));
=======
    PATCHES.forEach((p, i) => {
      events.push({
        id: `patch-${c}-${p.num}`, type: "patch",
        date: addDays(cycleStartDate, c * 28 + PATCH_CHANGE_DAYS[i]),
        patch: p.patch, patchType: p.type, color: p.color, emoji: p.emoji,
        week: p.week, patchNum: p.num, cycleNum: c + 1, label: `Change to ${p.patch}`,
      });
    });
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
  }
  return events;
}
function generateTostranSchedule(startDate, numDays = 180) {
  const events = [];
<<<<<<< HEAD
  for (let i = 0; i < numDays; i += 2)
    events.push({ id:`tostran-${i}`, type:"tostran", date:addDays(startDate,i), label:"Apply Tostran gel", color:"#C4B5D4", emoji:"💜" });
=======
  for (let i = 0; i < numDays; i += 2) {
    events.push({ id: `tostran-${i}`, type: "tostran", date: addDays(startDate, i), label: "Apply Tostran gel", color: "#C4B5D4", emoji: "💜" });
  }
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
  return events;
}
function generateICS(patchEvents, tostranEvents) {
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//HRT Tracker//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH"];
<<<<<<< HEAD
  [...patchEvents,...tostranEvents].forEach(ev => {
    const d=ev.date, dt=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    const n=addDays(d,1), dt2=`${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}${String(n.getDate()).padStart(2,"0")}`;
    lines.push("BEGIN:VEVENT",`UID:${ev.id}@hrt`,`DTSTART;VALUE=DATE:${dt}`,`DTEND;VALUE=DATE:${dt2}`,
      `SUMMARY:${ev.emoji} ${ev.label}`,`DESCRIPTION:${ev.type==="patch"?`Patch #${ev.patchNum}/8: ${ev.patch}`:"Tostran gel"}`,
=======
  [...patchEvents, ...tostranEvents].forEach((ev) => {
    const d = ev.date;
    const dt  = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    const n   = addDays(d,1);
    const dt2 = `${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}${String(n.getDate()).padStart(2,"0")}`;
    lines.push("BEGIN:VEVENT",`UID:${ev.id}@hrt`,`DTSTART;VALUE=DATE:${dt}`,`DTEND;VALUE=DATE:${dt2}`,
      `SUMMARY:${ev.emoji} ${ev.label}`,`DESCRIPTION:${ev.type==="patch"?`Patch #${ev.patchNum}/8: ${ev.patch}`:"Tostran gel — every other day"}`,
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
      "BEGIN:VALARM","TRIGGER:-PT30M","ACTION:DISPLAY",`DESCRIPTION:${ev.label}`,"END:VALARM","END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

<<<<<<< HEAD
// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [name, setName] = useState(""), [loading, setLoading] = useState(false), [error, setError] = useState("");
  async function handleLogin() {
    const uid = name.trim().toLowerCase();
    if (!uid) { setError("Please enter your name"); return; }
    setLoading(true); setError("");
    try { const d = await sbGet(uid); onLogin(uid, d); }
    catch { setError("Couldn't connect — check your internet"); }
    setLoading(false);
  }
=======
// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [name, setName]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) { setError("Please enter your name"); return; }
    setLoading(true);
    setError("");
    try {
      const existing = await sbGet(trimmed);
      onLogin(trimmed, existing);
    } catch(e) {
      setError("Couldn't connect — check your internet and try again");
    }
    setLoading(false);
  }

>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#FDF6F0,#F5EDE8,#EDE8F5)", fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ fontSize:52, marginBottom:16 }}>🌸</div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:"#3D2B1F", fontWeight:700, marginBottom:8 }}>HRT Tracker</div>
      <div style={{ fontSize:14, color:"#A08070", marginBottom:40, textAlign:"center" }}>Your data syncs across all your devices</div>
<<<<<<< HEAD
      <div style={{ width:"100%", maxWidth:340 }}>
        <label style={labelStyle}>Who are you?</label>
        <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Enter your first name" style={{ ...inputStyle, fontSize:16, padding:"13px 16px", marginBottom:8 }} autoFocus />
        <div style={{ fontSize:12, color:"#A08070", marginBottom:20 }}>Use the same name on all your devices. Your partner uses their own name.</div>
        {error && <div style={{ fontSize:13, color:"#C4856A", marginBottom:12 }}>⚠ {error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:loading?"#E0D5CC":"#C4856A", color:"white", fontSize:15, fontWeight:600, cursor:loading?"default":"pointer" }}>
          {loading?"Loading…":"Continue →"}
=======

      <div style={{ width:"100%", maxWidth:340 }}>
        <label style={labelStyle}>Who are you?</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="Enter your first name"
          style={{ ...inputStyle, fontSize:16, padding:"13px 16px", marginBottom:8 }}
          autoFocus
        />
        <div style={{ fontSize:12, color:"#A08070", marginBottom:20 }}>
          This is used to keep your data separate from your partner's. Use the same name on all your devices.
        </div>
        {error && <div style={{ fontSize:13, color:"#C4856A", marginBottom:12 }}>⚠ {error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background: loading ? "#E0D5CC" : "#C4856A", color:"white", fontSize:15, fontWeight:600, cursor: loading ? "default" : "pointer", transition:"all 0.2s" }}>
          {loading ? "Loading…" : "Continue →"}
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
        </button>
      </div>
    </div>
  );
}

// ─── Setup Wizard ─────────────────────────────────────────────────────────────
function SetupWizard({ onComplete }) {
<<<<<<< HEAD
  const [step,setStep]=useState(1),[selectedPatch,setSelectedPatch]=useState(null);
  const [appliedDate,setAppliedDate]=useState(formatDate(new Date())),[tostranDate,setTostranDate]=useState(formatDate(new Date()));
  const [trackTostran,setTrackTostran]=useState(true);
  function finish() { onComplete({ patchNum:selectedPatch, appliedDate:new Date(appliedDate+"T12:00:00"), tostranDate:trackTostran?new Date(tostranDate+"T12:00:00"):null }); }
=======
  const [step, setStep]               = useState(1);
  const [selectedPatch, setSelectedPatch] = useState(null);
  const [appliedDate, setAppliedDate] = useState(formatDate(new Date()));
  const [tostranDate, setTostranDate] = useState(formatDate(new Date()));
  const [trackTostran, setTrackTostran] = useState(true);

  function finish() {
    onComplete({ patchNum: selectedPatch, appliedDate: new Date(appliedDate+"T12:00:00"), tostranDate: trackTostran ? new Date(tostranDate+"T12:00:00") : null });
  }

>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#FDF6F0,#F5EDE8,#EDE8F5)", fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ padding:"28px 24px 0", textAlign:"center" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:"#3D2B1F", fontWeight:700 }}>Set up your schedule</div>
        <div style={{ fontSize:13, color:"#A08070", marginTop:4 }}>Just a few quick questions</div>
<<<<<<< HEAD
      </div>
      <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:20 }}>
        {[1,2,3].map(s=><div key={s} style={{ width:s===step?24:8, height:8, borderRadius:4, background:s===step?"#C4856A":s<step?"#A5B8A5":"#E0D5CC", transition:"all 0.3s" }} />)}
      </div>
      <div style={{ flex:1, padding:"24px 20px 32px", maxWidth:480, margin:"0 auto", width:"100%" }}>
        {step===1&&(<div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#3D2B1F", fontWeight:700, marginBottom:6 }}>Which patch are you on?</div>
          <div style={{ fontSize:13, color:"#8A7265", marginBottom:20, lineHeight:1.5 }}>Select the patch you're <strong>currently wearing</strong>.</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
            {PATCHES.map(p=>{ const s=selectedPatch===p.num; return <button key={p.num} onClick={()=>setSelectedPatch(p.num)} style={{ border:`2px solid ${s?p.color:"#E0D5CC"}`, borderRadius:14, padding:"14px 4px 10px", cursor:"pointer", background:s?p.color+"20":"white", transition:"all 0.2s", boxShadow:s?`0 4px 14px ${p.color}44`:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}><span style={{ fontSize:22 }}>{p.emoji}</span><span style={{ fontSize:16, fontWeight:700, color:s?(p.num<=4?"#B07070":"#5A8A6A"):"#3D2B1F" }}>#{p.num}</span><span style={{ fontSize:9, color:"#9A8070", textAlign:"center" }}>{p.num<=4?"Evorel 50":"Conti"}</span><span style={{ fontSize:9, color:"#B0A090" }}>Wk {p.week}</span></button>; })}
          </div>
          {selectedPatch&&(()=>{ const p=PATCHES[selectedPatch-1]; return <div style={{ background:p.color+"18", border:`1px solid ${p.color}55`, borderRadius:12, padding:"12px 14px", marginBottom:20, fontSize:13, color:"#5A4A3A", lineHeight:1.6 }}><strong>{p.emoji} Patch #{p.num} — {p.patch}</strong><br />{p.type} · Week {p.week}</div>; })()}
          <button onClick={()=>selectedPatch&&setStep(2)} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:selectedPatch?"#C4856A":"#E0D5CC", color:selectedPatch?"white":"#A09080", fontSize:15, fontWeight:600, cursor:selectedPatch?"pointer":"default" }}>Continue →</button>
          <div style={{ textAlign:"center", marginTop:14 }}><button onClick={()=>onComplete({patchNum:1,appliedDate:new Date(),tostranDate:new Date()})} style={{ background:"none", border:"none", fontSize:12, color:"#A08070", cursor:"pointer", textDecoration:"underline" }}>Starting fresh (patch #1 today)</button></div>
        </div>)}
        {step===2&&selectedPatch&&(()=>{ const p=PATCHES[selectedPatch-1]; const preview=calcCycleStart(selectedPatch,new Date(appliedDate+"T12:00:00")); return (<div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#3D2B1F", fontWeight:700, marginBottom:6 }}>When did you apply patch #{selectedPatch}?</div>
          <div style={{ background:p.color+"15", border:`1px solid ${p.color}44`, borderRadius:12, padding:"12px 14px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}><span style={{ fontSize:24 }}>{p.emoji}</span><div style={{ fontSize:13, color:"#5A4A3A" }}><strong>Patch #{p.num} — {p.patch}</strong><br /><span style={{ fontSize:11, color:"#9A8070" }}>{p.type}</span></div></div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>{["Today","Yesterday"].map(label=>{ const val=formatDate(label==="Today"?new Date():addDays(new Date(),-1)); return <button key={label} onClick={()=>setAppliedDate(val)} style={{ flex:1, padding:"10px", borderRadius:10, border:`2px solid ${appliedDate===val?"#C4856A":"#E0D5CC"}`, background:appliedDate===val?"#FFF0E8":"white", fontSize:13, fontWeight:600, color:appliedDate===val?"#C4856A":"#7A6558", cursor:"pointer" }}>{label}</button>; })}</div>
          <label style={labelStyle}>Or pick a date:</label>
          <input type="date" value={appliedDate} onChange={e=>setAppliedDate(e.target.value)} style={inputStyle} max={formatDate(new Date())} />
          <div style={{ background:"#F7F9F7", border:"1px solid #D5E5D5", borderRadius:10, padding:"10px 14px", marginTop:12, fontSize:12, color:"#6A8A6A" }}>📅 Cycle start: <strong>{preview.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</strong></div>
          <div style={{ display:"flex", gap:8, marginTop:20 }}><button onClick={()=>setStep(1)} style={{ flex:1, padding:"13px", borderRadius:14, border:"1px solid #E0D5CC", background:"white", fontSize:14, color:"#7A6558", cursor:"pointer" }}>← Back</button><button onClick={()=>setStep(3)} style={{ flex:2, padding:"13px", borderRadius:14, border:"none", background:"#C4856A", color:"white", fontSize:14, fontWeight:600, cursor:"pointer" }}>Continue →</button></div>
        </div>); })()}
        {step===3&&(<div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#3D2B1F", fontWeight:700, marginBottom:6 }}>Tostran gel?</div>
          <div style={{ display:"flex", gap:8, marginBottom:20 }}>{[["Yes, track it",true],["No thanks",false]].map(([label,val])=><button key={String(val)} onClick={()=>setTrackTostran(val)} style={{ flex:1, padding:"12px", borderRadius:12, border:`2px solid ${trackTostran===val?"#C4B5D4":"#E0D5CC"}`, background:trackTostran===val?"#F5F0FF":"white", fontSize:13, fontWeight:600, color:trackTostran===val?"#7A5A9A":"#7A6558", cursor:"pointer" }}>{label}</button>)}</div>
          {trackTostran&&(<div><div style={{ background:"#F5F0FF", border:"1px solid #D5C8F0", borderRadius:12, padding:"12px 14px", marginBottom:16, fontSize:12, color:"#6A5A8A", lineHeight:1.5 }}>💜 Set the date of your <strong>most recent</strong> application.</div><div style={{ display:"flex", gap:8, marginBottom:10 }}>{["Today","Yesterday"].map(label=>{ const val=formatDate(label==="Today"?new Date():addDays(new Date(),-1)); return <button key={label} onClick={()=>setTostranDate(val)} style={{ flex:1, padding:"10px", borderRadius:10, border:`2px solid ${tostranDate===val?"#C4B5D4":"#E0D5CC"}`, background:tostranDate===val?"#F5F0FF":"white", fontSize:13, fontWeight:600, color:tostranDate===val?"#7A5A9A":"#7A6558", cursor:"pointer" }}>{label}</button>; })}</div><label style={labelStyle}>Or pick a date:</label><input type="date" value={tostranDate} onChange={e=>setTostranDate(e.target.value)} style={inputStyle} max={formatDate(new Date())} /></div>)}
          <div style={{ display:"flex", gap:8, marginTop:24 }}><button onClick={()=>setStep(2)} style={{ flex:1, padding:"13px", borderRadius:14, border:"1px solid #E0D5CC", background:"white", fontSize:14, color:"#7A6558", cursor:"pointer" }}>← Back</button><button onClick={finish} style={{ flex:2, padding:"13px", borderRadius:14, border:"none", background:"#C4856A", color:"white", fontSize:15, fontWeight:600, cursor:"pointer" }}>Start tracking 🌸</button></div>
        </div>)}
=======
      </div>
      <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:20 }}>
        {[1,2,3].map(s => <div key={s} style={{ width:s===step?24:8, height:8, borderRadius:4, background:s===step?"#C4856A":s<step?"#A5B8A5":"#E0D5CC", transition:"all 0.3s" }} />)}
      </div>

      <div style={{ flex:1, padding:"24px 20px 32px", maxWidth:480, margin:"0 auto", width:"100%" }}>

        {step===1 && (
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#3D2B1F", fontWeight:700, marginBottom:6 }}>Which patch are you on?</div>
            <div style={{ fontSize:13, color:"#8A7265", marginBottom:20, lineHeight:1.5 }}>Select the patch you're <strong>currently wearing</strong>. Patches 1–4 are Evorel 50, patches 5–8 are Evorel Conti.</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
              {PATCHES.map(p => {
                const isSel = selectedPatch===p.num;
                return (
                  <button key={p.num} onClick={() => setSelectedPatch(p.num)} style={{ border:`2px solid ${isSel?p.color:"#E0D5CC"}`, borderRadius:14, padding:"14px 4px 10px", cursor:"pointer", background:isSel?p.color+"20":"white", transition:"all 0.2s", boxShadow:isSel?`0 4px 14px ${p.color}44`:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:22 }}>{p.emoji}</span>
                    <span style={{ fontSize:16, fontWeight:700, color:isSel?(p.num<=4?"#B07070":"#5A8A6A"):"#3D2B1F" }}>#{p.num}</span>
                    <span style={{ fontSize:9, color:"#9A8070", textAlign:"center" }}>{p.num<=4?"Evorel 50":"Conti"}</span>
                    <span style={{ fontSize:9, color:"#B0A090" }}>Wk {p.week}</span>
                  </button>
                );
              })}
            </div>
            {selectedPatch && (() => { const p=PATCHES[selectedPatch-1]; return <div style={{ background:p.color+"18", border:`1px solid ${p.color}55`, borderRadius:12, padding:"12px 14px", marginBottom:20, fontSize:13, color:"#5A4A3A", lineHeight:1.6 }}><strong>{p.emoji} Patch #{p.num} — {p.patch}</strong><br />{p.type} · Week {p.week} of 4-week cycle</div>; })()}
            <button onClick={() => selectedPatch && setStep(2)} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:selectedPatch?"#C4856A":"#E0D5CC", color:selectedPatch?"white":"#A09080", fontSize:15, fontWeight:600, cursor:selectedPatch?"pointer":"default", transition:"all 0.2s" }}>Continue →</button>
            <div style={{ textAlign:"center", marginTop:14 }}>
              <button onClick={() => onComplete({ patchNum:1, appliedDate:new Date(), tostranDate:new Date() })} style={{ background:"none", border:"none", fontSize:12, color:"#A08070", cursor:"pointer", textDecoration:"underline" }}>Starting fresh (patch #1 today)</button>
            </div>
          </div>
        )}

        {step===2 && selectedPatch && (() => {
          const p = PATCHES[selectedPatch-1];
          const preview = calcCycleStart(selectedPatch, new Date(appliedDate+"T12:00:00"));
          return (
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#3D2B1F", fontWeight:700, marginBottom:6 }}>When did you apply patch #{selectedPatch}?</div>
              <div style={{ fontSize:13, color:"#8A7265", marginBottom:20 }}>This lets us back-calculate your full schedule accurately.</div>
              <div style={{ background:p.color+"15", border:`1px solid ${p.color}44`, borderRadius:12, padding:"12px 14px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:24 }}>{p.emoji}</span>
                <div style={{ fontSize:13, color:"#5A4A3A" }}><strong>Patch #{p.num} — {p.patch}</strong><br /><span style={{ fontSize:11, color:"#9A8070" }}>{p.type}</span></div>
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                {["Today","Yesterday"].map(label => { const val=formatDate(label==="Today"?new Date():addDays(new Date(),-1)); return <button key={label} onClick={() => setAppliedDate(val)} style={{ flex:1, padding:"10px", borderRadius:10, border:`2px solid ${appliedDate===val?"#C4856A":"#E0D5CC"}`, background:appliedDate===val?"#FFF0E8":"white", fontSize:13, fontWeight:600, color:appliedDate===val?"#C4856A":"#7A6558", cursor:"pointer" }}>{label}</button>; })}
              </div>
              <label style={labelStyle}>Or pick a date:</label>
              <input type="date" value={appliedDate} onChange={e => setAppliedDate(e.target.value)} style={inputStyle} max={formatDate(new Date())} />
              <div style={{ background:"#F7F9F7", border:"1px solid #D5E5D5", borderRadius:10, padding:"10px 14px", marginTop:12, fontSize:12, color:"#6A8A6A" }}>
                📅 Cycle start: <strong>{preview.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</strong>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:20 }}>
                <button onClick={() => setStep(1)} style={{ flex:1, padding:"13px", borderRadius:14, border:"1px solid #E0D5CC", background:"white", fontSize:14, color:"#7A6558", cursor:"pointer" }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ flex:2, padding:"13px", borderRadius:14, border:"none", background:"#C4856A", color:"white", fontSize:14, fontWeight:600, cursor:"pointer" }}>Continue →</button>
              </div>
            </div>
          );
        })()}

        {step===3 && (
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#3D2B1F", fontWeight:700, marginBottom:6 }}>Tostran gel?</div>
            <div style={{ fontSize:13, color:"#8A7265", marginBottom:20 }}>Do you also want to track Tostran? Applied every other day.</div>
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              {[["Yes, track it",true],["No thanks",false]].map(([label,val]) => (
                <button key={String(val)} onClick={() => setTrackTostran(val)} style={{ flex:1, padding:"12px", borderRadius:12, border:`2px solid ${trackTostran===val?"#C4B5D4":"#E0D5CC"}`, background:trackTostran===val?"#F5F0FF":"white", fontSize:13, fontWeight:600, color:trackTostran===val?"#7A5A9A":"#7A6558", cursor:"pointer" }}>{label}</button>
              ))}
            </div>
            {trackTostran && (
              <div>
                <div style={{ background:"#F5F0FF", border:"1px solid #D5C8F0", borderRadius:12, padding:"12px 14px", marginBottom:16, fontSize:12, color:"#6A5A8A", lineHeight:1.5 }}>💜 Set the date of your <strong>most recent</strong> application.</div>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  {["Today","Yesterday"].map(label => { const val=formatDate(label==="Today"?new Date():addDays(new Date(),-1)); return <button key={label} onClick={() => setTostranDate(val)} style={{ flex:1, padding:"10px", borderRadius:10, border:`2px solid ${tostranDate===val?"#C4B5D4":"#E0D5CC"}`, background:tostranDate===val?"#F5F0FF":"white", fontSize:13, fontWeight:600, color:tostranDate===val?"#7A5A9A":"#7A6558", cursor:"pointer" }}>{label}</button>; })}
                </div>
                <label style={labelStyle}>Or pick a date:</label>
                <input type="date" value={tostranDate} onChange={e => setTostranDate(e.target.value)} style={inputStyle} max={formatDate(new Date())} />
              </div>
            )}
            <div style={{ display:"flex", gap:8, marginTop:24 }}>
              <button onClick={() => setStep(2)} style={{ flex:1, padding:"13px", borderRadius:14, border:"1px solid #E0D5CC", background:"white", fontSize:14, color:"#7A6558", cursor:"pointer" }}>← Back</button>
              <button onClick={finish} style={{ flex:2, padding:"13px", borderRadius:14, border:"none", background:"#C4856A", color:"white", fontSize:15, fontWeight:600, cursor:"pointer" }}>Start tracking 🌸</button>
            </div>
          </div>
        )}
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
      </div>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function CalendarView({ patchEvents, tostranEvents, viewDate, setViewDate }) {
<<<<<<< HEAD
  const year=viewDate.getFullYear(),month=viewDate.getMonth();
  const firstDay=new Date(year,month,1).getDay(),daysInMonth=new Date(year,month+1,0).getDate();
  const today=new Date(),all=[...patchEvents,...tostranEvents];
  function evs(day){const d=new Date(year,month,day);return all.filter(e=>isSameDay(e.date,d));}
  const cells=[];for(let i=0;i<firstDay;i++)cells.push(null);for(let d=1;d<=daysInMonth;d++)cells.push(d);
  return (<div>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
      <button onClick={()=>setViewDate(new Date(year,month-1,1))} style={navBtnStyle}>‹</button>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:19, color:"#3D2B1F", fontWeight:700 }}>{MONTH_NAMES[month]} {year}</div>
      <button onClick={()=>setViewDate(new Date(year,month+1,1))} style={navBtnStyle}>›</button>
=======
  const year=viewDate.getFullYear(), month=viewDate.getMonth();
  const firstDay=new Date(year,month,1).getDay(), daysInMonth=new Date(year,month+1,0).getDate();
  const today=new Date(), all=[...patchEvents,...tostranEvents];
  function evs(day) { const d=new Date(year,month,day); return all.filter(e=>isSameDay(e.date,d)); }
  const cells=[]; for(let i=0;i<firstDay;i++) cells.push(null); for(let d=1;d<=daysInMonth;d++) cells.push(d);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <button onClick={() => setViewDate(new Date(year,month-1,1))} style={navBtnStyle}>‹</button>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:19, color:"#3D2B1F", fontWeight:700 }}>{MONTH_NAMES[month]} {year}</div>
        <button onClick={() => setViewDate(new Date(year,month+1,1))} style={navBtnStyle}>›</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
        {DAY_NAMES.map(d => <div key={d} style={{ textAlign:"center", fontSize:10, color:"#A08070", fontWeight:600, padding:"3px 0" }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
        {cells.map((day,i) => {
          if(!day) return <div key={`e-${i}`} />;
          const ev=evs(day), isT=isSameDay(new Date(year,month,day),today);
          return (
            <div key={day} style={{ minHeight:52, background:isT?"#F5EDE8":"#FDFAF7", border:isT?"2px solid #C4856A":"1px solid #EDE5DC", borderRadius:9, padding:"3px 4px" }}>
              <div style={{ fontSize:11, color:isT?"#C4856A":"#7A6558", fontWeight:isT?700:400, marginBottom:2 }}>{day}</div>
              {ev.map(e => <div key={e.id} title={e.label} style={{ background:e.color, borderRadius:3, padding:"1px 3px", fontSize:9, color:"#fff", marginBottom:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontWeight:600 }}>{e.emoji} {e.type==="patch"?`#${e.patchNum} ${e.patch.replace("Evorel ","")}` :"Tos"}</div>)}
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", gap:12, marginTop:14, flexWrap:"wrap" }}>
        {[{color:"#D4A5A5",emoji:"🌸",label:"Evorel 50"},{color:"#A5B8A5",emoji:"🌿",label:"Evorel Conti"},{color:"#C4B5D4",emoji:"💜",label:"Tostran"}].map(l => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10, height:10, borderRadius:2, background:l.color }} /><span style={{ fontSize:11, color:"#8A7265" }}>{l.emoji} {l.label}</span></div>
        ))}
      </div>
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
      {DAY_NAMES.map(d=><div key={d} style={{ textAlign:"center", fontSize:10, color:"#A08070", fontWeight:600, padding:"3px 0" }}>{d}</div>)}
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
      {cells.map((day,i)=>{ if(!day)return <div key={`e-${i}`} />;const ev=evs(day),isT=isSameDay(new Date(year,month,day),today);
        return <div key={day} style={{ minHeight:52, background:isT?"#F5EDE8":"#FDFAF7", border:isT?"2px solid #C4856A":"1px solid #EDE5DC", borderRadius:9, padding:"3px 4px" }}><div style={{ fontSize:11, color:isT?"#C4856A":"#7A6558", fontWeight:isT?700:400, marginBottom:2 }}>{day}</div>{ev.map(e=><div key={e.id} title={e.label} style={{ background:e.color, borderRadius:3, padding:"1px 3px", fontSize:9, color:"#fff", marginBottom:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontWeight:600 }}>{e.emoji} {e.type==="patch"?`#${e.patchNum} ${e.patch.replace("Evorel ","")}`:"Tos"}</div>)}</div>; })}
    </div>
    <div style={{ display:"flex", gap:12, marginTop:14, flexWrap:"wrap" }}>
      {[{color:"#D4A5A5",emoji:"🌸",label:"Evorel 50"},{color:"#A5B8A5",emoji:"🌿",label:"Evorel Conti"},{color:"#C4B5D4",emoji:"💜",label:"Tostran"}].map(l=>(
        <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10, height:10, borderRadius:2, background:l.color }} /><span style={{ fontSize:11, color:"#8A7265" }}>{l.emoji} {l.label}</span></div>
      ))}
    </div>
  </div>);
}

<<<<<<< HEAD
// ─── Dose Card ────────────────────────────────────────────────────────────────
=======
// ─── Dose card ────────────────────────────────────────────────────────────────
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
function DoseCard({ ev, done, onToggle, gcalUrl }) {
  return (
    <div style={{ background:done?"#F7FBF7":"white", borderRadius:16, padding:"16px 18px", marginBottom:10, border:`1.5px solid ${done?"#A5C4A5":ev.color+"88"}`, boxShadow:done?"none":`0 4px 16px ${ev.color}22`, transition:"all 0.3s" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ width:46, height:46, borderRadius:13, background:done?"#E8F5E8":ev.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{done?"✅":ev.emoji}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:done?"#7A9A7A":"#3D2B1F", fontWeight:600, textDecoration:done?"line-through":"none" }}>
            {ev.label}{ev.patchNum&&<span style={{ fontSize:12, fontWeight:400, color:"#A08070" }}> (#{ev.patchNum} of 8)</span>}
          </div>
          <div style={{ fontSize:12, color:"#A08070", marginTop:3 }}>{ev.type==="patch"?`${ev.patchType} · Week ${ev.week} of cycle`:"Every other day — inner thigh or abdomen"}</div>
        </div>
<<<<<<< HEAD
        <button onClick={()=>window.open(gcalUrl,"_blank")} title="Add to Google Calendar" style={{ background:"none", border:"1px solid #E0D5CC", borderRadius:8, padding:"6px 8px", cursor:"pointer", fontSize:13, color:"#7A6558", flexShrink:0 }}>📅</button>
=======
        <button onClick={() => window.open(gcalUrl,"_blank")} title="Add to Google Calendar" style={{ background:"none", border:"1px solid #E0D5CC", borderRadius:8, padding:"6px 8px", cursor:"pointer", fontSize:13, color:"#7A6558", flexShrink:0 }}>📅</button>
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
      </div>
      <button onClick={onToggle} style={{ marginTop:12, width:"100%", background:done?"#E8F5E8":ev.color, color:done?"#5A8A5A":"white", border:"none", borderRadius:10, padding:"10px", cursor:"pointer", fontSize:13, fontWeight:600, transition:"all 0.2s" }}>
        {done?"✓ Done — tap to undo":"Mark as done"}
      </button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function HRTTracker() {
<<<<<<< HEAD
  const [userId,setUserId]             = useState(()=>localStorage.getItem("hrt_userId")||null);
  const [setupDone,setSetupDone]       = useState(false);
  const [syncing,setSyncing]           = useState(false);
  const [syncStatus,setSyncStatus]     = useState(null);
  const [pushEnabled,setPushEnabled]   = useState(false);
  const [patchNum,setPatchNum]         = useState(1);
  const [patchAppliedDate,setPatchAppliedDate] = useState(new Date());
  const [tostranStartDate,setTostranStartDate] = useState(null);
  const [completedDoses,setCompletedDoses]     = useState({});
  const [tab,setTab]                   = useState("today");
  const [viewDate,setViewDate]         = useState(new Date());
  const [showSettings,setShowSettings] = useState(false);
  const [editPatchNum,setEditPatchNum] = useState(1);
  const [editAppliedDate,setEditAppliedDate] = useState(formatDate(new Date()));
  const [editTostranDate,setEditTostranDate] = useState(formatDate(new Date()));
  const [editTrackTostran,setEditTrackTostran] = useState(true);
  const saveTimer = useRef(null);

  // Check push status on load
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription().then(sub => setPushEnabled(!!sub))
      );
    }
  }, []);

=======
  const [userId, setUserId]           = useState(() => localStorage.getItem("hrt_userId") || null);
  const [setupDone, setSetupDone]     = useState(false);
  const [syncing, setSyncing]         = useState(false);
  const [syncStatus, setSyncStatus]   = useState(null); // "saved" | "error"
  const [patchNum, setPatchNum]       = useState(1);
  const [patchAppliedDate, setPatchAppliedDate] = useState(new Date());
  const [tostranStartDate, setTostranStartDate] = useState(null);
  const [completedDoses, setCompletedDoses]     = useState({});
  const [tab, setTab]                 = useState("today");
  const [viewDate, setViewDate]       = useState(new Date());
  const [notifStatus, setNotifStatus] = useState(typeof Notification!=="undefined"?Notification.permission:"unsupported");
  const [showSettings, setShowSettings] = useState(false);
  const [editPatchNum, setEditPatchNum] = useState(1);
  const [editAppliedDate, setEditAppliedDate] = useState(formatDate(new Date()));
  const [editTostranDate, setEditTostranDate] = useState(formatDate(new Date()));
  const [editTrackTostran, setEditTrackTostran] = useState(true);
  const saveTimer = useRef(null);

  // Load from Supabase on login
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
  async function handleLogin(uid, cloudData) {
    localStorage.setItem("hrt_userId", uid);
    setUserId(uid);
    if (cloudData) {
<<<<<<< HEAD
      setPatchNum(cloudData.patchNum||1);
      setPatchAppliedDate(new Date(cloudData.patchAppliedDate||new Date()));
      setTostranStartDate(cloudData.tostranStartDate?new Date(cloudData.tostranStartDate):null);
      setCompletedDoses(cloudData.completedDoses||{});
=======
      setPatchNum(cloudData.patchNum || 1);
      setPatchAppliedDate(new Date(cloudData.patchAppliedDate || new Date()));
      setTostranStartDate(cloudData.tostranStartDate ? new Date(cloudData.tostranStartDate) : null);
      setCompletedDoses(cloudData.completedDoses || {});
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
      setSetupDone(true);
    }
  }

<<<<<<< HEAD
  function getPayload(pn,pad,tsd,cd) {
    return { patchNum:pn, patchAppliedDate:formatDate(pad), tostranStartDate:tsd?formatDate(tsd):null, completedDoses:cd };
  }

  function scheduleSave(pn,pad,tsd,cd) {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async()=>{
      if(!userId)return;
      setSyncing(true);
      try { await sbUpsert(userId,getPayload(pn,pad,tsd,cd)); setSyncStatus("saved"); setTimeout(()=>setSyncStatus(null),2000); }
      catch { setSyncStatus("error"); }
      setSyncing(false);
    },1200);
  }

  async function handleSetupComplete({ patchNum:pn, appliedDate, tostranDate }) {
    setPatchNum(pn); setPatchAppliedDate(appliedDate); setTostranStartDate(tostranDate);
    setSetupDone(true);
    setEditPatchNum(pn); setEditAppliedDate(formatDate(appliedDate));
    setEditTostranDate(tostranDate?formatDate(tostranDate):formatDate(new Date()));
    setEditTrackTostran(!!tostranDate);
    setSyncing(true);
    try { await sbUpsert(userId,getPayload(pn,appliedDate,tostranDate,{})); setSyncStatus("saved"); setTimeout(()=>setSyncStatus(null),2000); }
    catch { setSyncStatus("error"); }
=======
  function getCloudPayload(pn, pad, tsd, cd) {
    return { patchNum: pn, patchAppliedDate: formatDate(pad), tostranStartDate: tsd ? formatDate(tsd) : null, completedDoses: cd };
  }

  function scheduleSave(pn, pad, tsd, cd) {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!userId) return;
      setSyncing(true);
      try {
        await sbUpsert(userId, getCloudPayload(pn, pad, tsd, cd));
        setSyncStatus("saved");
        setTimeout(() => setSyncStatus(null), 2000);
      } catch { setSyncStatus("error"); }
      setSyncing(false);
    }, 1200);
  }

  async function handleSetupComplete({ patchNum: pn, appliedDate, tostranDate }) {
    setPatchNum(pn); setPatchAppliedDate(appliedDate); setTostranStartDate(tostranDate);
    setSetupDone(true);
    setEditPatchNum(pn); setEditAppliedDate(formatDate(appliedDate));
    setEditTostranDate(tostranDate ? formatDate(tostranDate) : formatDate(new Date()));
    setEditTrackTostran(!!tostranDate);
    setSyncing(true);
    try {
      await sbUpsert(userId, getCloudPayload(pn, appliedDate, tostranDate, {}));
      setSyncStatus("saved"); setTimeout(() => setSyncStatus(null), 2000);
    } catch { setSyncStatus("error"); }
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
    setSyncing(false);
  }

  function toggleDone(id) {
<<<<<<< HEAD
    const next={...completedDoses,[id]:!completedDoses[id]};
    setCompletedDoses(next);
    scheduleSave(patchNum,patchAppliedDate,tostranStartDate,next);
  }

  async function handleEnablePush() {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
    const ok = await subscribeToPush(userId);
    setPushEnabled(ok);
  }

  async function handleDisablePush() {
    await unsubscribeFromPush();
    setPushEnabled(false);
  }

  async function saveSettings() {
    const ad=new Date(editAppliedDate+"T12:00:00"), td=editTrackTostran?new Date(editTostranDate+"T12:00:00"):null;
    setPatchNum(editPatchNum); setPatchAppliedDate(ad); setTostranStartDate(td);
    setShowSettings(false); setSyncing(true);
    try { await sbUpsert(userId,getPayload(editPatchNum,ad,td,completedDoses)); setSyncStatus("saved"); setTimeout(()=>setSyncStatus(null),2000); }
    catch { setSyncStatus("error"); }
=======
    const next = { ...completedDoses, [id]: !completedDoses[id] };
    setCompletedDoses(next);
    scheduleSave(patchNum, patchAppliedDate, tostranStartDate, next);
  }

  async function saveSettings() {
    const ad = new Date(editAppliedDate+"T12:00:00");
    const td = editTrackTostran ? new Date(editTostranDate+"T12:00:00") : null;
    setPatchNum(editPatchNum); setPatchAppliedDate(ad); setTostranStartDate(td);
    setShowSettings(false);
    setSyncing(true);
    try {
      await sbUpsert(userId, getCloudPayload(editPatchNum, ad, td, completedDoses));
      setSyncStatus("saved"); setTimeout(() => setSyncStatus(null), 2000);
    } catch { setSyncStatus("error"); }
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
    setSyncing(false);
  }

  function logout() { localStorage.removeItem("hrt_userId"); setUserId(null); setSetupDone(false); }
  function exportICS() {
<<<<<<< HEAD
    const ics=generateICS(patchEvents,tostranEvents);
    const blob=new Blob([ics],{type:"text/calendar"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="hrt-schedule.ics"; a.click();
    URL.revokeObjectURL(url);
  }
  function gcalUrl(ev) {
    const d=ev.date,dt=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    const n=addDays(d,1),dt2=`${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}${String(n.getDate()).padStart(2,"0")}`;
    return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(ev.emoji+" "+ev.label)}&dates=${dt}/${dt2}&details=${encodeURIComponent(ev.type==="patch"?`Patch #${ev.patchNum}/8: ${ev.patch}`:"Tostran gel — every other day")}`;
=======
    const ics = generateICS(patchEvents, tostranEvents);
    const blob = new Blob([ics],{type:"text/calendar"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="hrt-schedule.ics"; a.click();
    URL.revokeObjectURL(url);
  }
  function gcalUrl(ev) {
    const d=ev.date, dt=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    const n=addDays(d,1), dt2=`${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}${String(n.getDate()).padStart(2,"0")}`;
    return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(ev.emoji+" "+ev.label)}&dates=${dt}/${dt2}&details=${encodeURIComponent(ev.type==="patch"?`Patch #${ev.patchNum}/8: ${ev.patch} — ${ev.patchType}`:"Tostran gel — every other day")}`;
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
  }

  if (!userId) return <LoginScreen onLogin={handleLogin} />;
  if (!setupDone) return <SetupWizard onComplete={handleSetupComplete} />;

<<<<<<< HEAD
  const cycleStartDate=calcCycleStart(patchNum,patchAppliedDate);
  const patchEvents=generatePatchSchedule(cycleStartDate,6);
  const tostranEvents=tostranStartDate?generateTostranSchedule(tostranStartDate,180):[];
  const today=new Date();
  const todayPatch=patchEvents.find(e=>isSameDay(e.date,today));
  const todayTostran=tostranEvents.find(e=>isSameDay(e.date,today));
  const {patch:activePatch,cycleDay,slot:activePatchSlot}=getActivePatch(cycleStartDate);
  const upcoming=[...patchEvents,...tostranEvents].filter(e=>e.date>today&&!isSameDay(e.date,today)).sort((a,b)=>a.date-b.date).slice(0,6);
=======
  const cycleStartDate = calcCycleStart(patchNum, patchAppliedDate);
  const patchEvents    = generatePatchSchedule(cycleStartDate, 6);
  const tostranEvents  = tostranStartDate ? generateTostranSchedule(tostranStartDate, 180) : [];
  const today          = new Date();
  const todayPatch     = patchEvents.find(e => isSameDay(e.date, today));
  const todayTostran   = tostranEvents.find(e => isSameDay(e.date, today));
  const { patch: activePatch, cycleDay, slot: activePatchSlot } = getActivePatch(cycleStartDate);
  const upcoming       = [...patchEvents,...tostranEvents].filter(e=>e.date>today&&!isSameDay(e.date,today)).sort((a,b)=>a.date-b.date).slice(0,6);
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#FDF6F0,#F5EDE8,#EDE8F5)", fontFamily:"'DM Sans',sans-serif", paddingBottom:40 }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#C4856A22,#A5B8A522)", borderBottom:"1px solid #E8DDD5", padding:"18px 20px 14px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:520, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21, color:"#3D2B1F", fontWeight:700 }}>HRT Tracker</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:1 }}>
<<<<<<< HEAD
              <div style={{ width:6, height:6, borderRadius:"50%", background:syncing?"#E8C86A":syncStatus==="saved"?"#7BA57B":syncStatus==="error"?"#C4856A":"#C0C0C0" }} />
              <div style={{ fontSize:11, color:"#A08070" }}>{syncing?"Syncing…":syncStatus==="saved"?"Saved ✓":syncStatus==="error"?"Sync failed":userId}</div>
            </div>
          </div>
          <button onClick={()=>{ setEditPatchNum(patchNum); setEditAppliedDate(formatDate(patchAppliedDate)); setShowSettings(!showSettings); }} style={{ background:showSettings?"#C4856A":"white", border:"1px solid #E0D0C4", borderRadius:10, padding:"7px 13px", cursor:"pointer", fontSize:13, color:showSettings?"white":"#7A6558", fontWeight:500, transition:"all 0.2s" }}>⚙ Settings</button>
=======
              <div style={{ width:6, height:6, borderRadius:"50%", background: syncing?"#E8C86A":syncStatus==="saved"?"#7BA57B":syncStatus==="error"?"#C4856A":"#C0C0C0" }} />
              <div style={{ fontSize:11, color:"#A08070" }}>
                {syncing?"Syncing…":syncStatus==="saved"?"Saved ✓":syncStatus==="error"?"Sync failed":userId}
              </div>
            </div>
          </div>
          <button onClick={() => { setEditPatchNum(patchNum); setEditAppliedDate(formatDate(patchAppliedDate)); setShowSettings(!showSettings); }} style={{ background:showSettings?"#C4856A":"white", border:"1px solid #E0D0C4", borderRadius:10, padding:"7px 13px", cursor:"pointer", fontSize:13, color:showSettings?"white":"#7A6558", fontWeight:500, transition:"all 0.2s" }}>
            ⚙ Settings
          </button>
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
        </div>
      </div>

      <div style={{ maxWidth:520, margin:"0 auto", padding:"0 16px" }}>

        {/* Settings */}
<<<<<<< HEAD
        {showSettings&&(
=======
        {showSettings && (
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
          <div style={{ background:"white", borderRadius:18, padding:20, marginTop:16, border:"1px solid #EDE5DC", boxShadow:"0 4px 20px #C4856A11" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:"#3D2B1F", fontWeight:600, marginBottom:16 }}>Settings</div>
            <label style={labelStyle}>Current patch</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:8 }}>
<<<<<<< HEAD
              {PATCHES.map(p=>{ const s=editPatchNum===p.num; return <button key={p.num} onClick={()=>setEditPatchNum(p.num)} style={{ border:`2px solid ${s?p.color:"#E0D5CC"}`, borderRadius:12, padding:"10px 3px 8px", cursor:"pointer", background:s?p.color+"20":"#FDFAF7", transition:"all 0.2s", display:"flex", flexDirection:"column", alignItems:"center", gap:3, boxShadow:s?`0 3px 10px ${p.color}44`:"none" }}><span style={{ fontSize:18 }}>{p.emoji}</span><span style={{ fontSize:13, fontWeight:700, color:s?(p.num<=4?"#B07070":"#5A8A6A"):"#3D2B1F" }}>#{p.num}</span><span style={{ fontSize:9, color:"#A08070", textAlign:"center" }}>{p.num<=4?"Evorel 50":"Conti"}</span></button>; })}
            </div>
            <label style={labelStyle}>Date patch was applied</label>
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>{["Today","Yesterday"].map(label=>{ const val=formatDate(label==="Today"?new Date():addDays(new Date(),-1)); return <button key={label} onClick={()=>setEditAppliedDate(val)} style={{ flex:1, padding:"8px", borderRadius:8, border:`1.5px solid ${editAppliedDate===val?"#C4856A":"#E0D5CC"}`, background:editAppliedDate===val?"#FFF0E8":"white", fontSize:12, fontWeight:600, color:editAppliedDate===val?"#C4856A":"#7A6558", cursor:"pointer" }}>{label}</button>; })}</div>
            <input type="date" value={editAppliedDate} onChange={e=>setEditAppliedDate(e.target.value)} style={inputStyle} max={formatDate(new Date())} />
            <label style={{ ...labelStyle, marginTop:12 }}>Track Tostran?</label>
            <div style={{ display:"flex", gap:8, marginBottom:editTrackTostran?10:16 }}>{[["Yes",true],["No",false]].map(([l,v])=><button key={l} onClick={()=>setEditTrackTostran(v)} style={{ flex:1, padding:"8px", borderRadius:8, border:`1.5px solid ${editTrackTostran===v?"#C4B5D4":"#E0D5CC"}`, background:editTrackTostran===v?"#F5F0FF":"white", fontSize:12, fontWeight:600, color:editTrackTostran===v?"#7A5A9A":"#7A6558", cursor:"pointer" }}>{l}</button>)}</div>
            {editTrackTostran&&<div style={{ marginBottom:16 }}><label style={labelStyle}>Last Tostran application</label><input type="date" value={editTostranDate} onChange={e=>setEditTostranDate(e.target.value)} style={inputStyle} max={formatDate(new Date())} /></div>}

            {/* Push notifications section */}
            <div style={{ paddingTop:14, borderTop:"1px solid #F0E8E0", marginBottom:12 }}>
              <label style={labelStyle}>🔔 Push notifications</label>
              {!pushEnabled?(
                <div>
                  <div style={{ fontSize:12, color:"#8A7265", marginBottom:8, lineHeight:1.5 }}>
                    Get notified at 8am on every patch change day and Tostran day — even when the app is closed. Works on iPhone if added to home screen.
                  </div>
                  <button onClick={handleEnablePush} style={actionBtnStyle("#C4856A")}>Enable push notifications</button>
                </div>
              ):(
                <div>
                  <div style={{ fontSize:12, color:"#7BA57B", marginBottom:8 }}>✓ Push notifications active — you'll be notified at 8am on treatment days</div>
                  <button onClick={handleDisablePush} style={{ ...actionBtnStyle("#A09080"), background:"white", color:"#A09080", border:"1px solid #E0D5CC" }}>Disable notifications</button>
                </div>
              )}
            </div>

=======
              {PATCHES.map(p => { const isSel=editPatchNum===p.num; return <button key={p.num} onClick={() => setEditPatchNum(p.num)} style={{ border:`2px solid ${isSel?p.color:"#E0D5CC"}`, borderRadius:12, padding:"10px 3px 8px", cursor:"pointer", background:isSel?p.color+"20":"#FDFAF7", transition:"all 0.2s", display:"flex", flexDirection:"column", alignItems:"center", gap:3, boxShadow:isSel?`0 3px 10px ${p.color}44`:"none" }}><span style={{ fontSize:18 }}>{p.emoji}</span><span style={{ fontSize:13, fontWeight:700, color:isSel?(p.num<=4?"#B07070":"#5A8A6A"):"#3D2B1F" }}>#{p.num}</span><span style={{ fontSize:9, color:"#A08070", textAlign:"center" }}>{p.num<=4?"Evorel 50":"Conti"}</span></button>; })}
            </div>
            <label style={labelStyle}>Date patch was applied</label>
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              {["Today","Yesterday"].map(label => { const val=formatDate(label==="Today"?new Date():addDays(new Date(),-1)); return <button key={label} onClick={() => setEditAppliedDate(val)} style={{ flex:1, padding:"8px", borderRadius:8, border:`1.5px solid ${editAppliedDate===val?"#C4856A":"#E0D5CC"}`, background:editAppliedDate===val?"#FFF0E8":"white", fontSize:12, fontWeight:600, color:editAppliedDate===val?"#C4856A":"#7A6558", cursor:"pointer" }}>{label}</button>; })}
            </div>
            <input type="date" value={editAppliedDate} onChange={e => setEditAppliedDate(e.target.value)} style={inputStyle} max={formatDate(new Date())} />
            <label style={{ ...labelStyle, marginTop:12 }}>Track Tostran?</label>
            <div style={{ display:"flex", gap:8, marginBottom:editTrackTostran?10:16 }}>
              {[["Yes",true],["No",false]].map(([l,v]) => <button key={l} onClick={() => setEditTrackTostran(v)} style={{ flex:1, padding:"8px", borderRadius:8, border:`1.5px solid ${editTrackTostran===v?"#C4B5D4":"#E0D5CC"}`, background:editTrackTostran===v?"#F5F0FF":"white", fontSize:12, fontWeight:600, color:editTrackTostran===v?"#7A5A9A":"#7A6558", cursor:"pointer" }}>{l}</button>)}
            </div>
            {editTrackTostran && <div style={{ marginBottom:16 }}><label style={labelStyle}>Last Tostran application</label><input type="date" value={editTostranDate} onChange={e => setEditTostranDate(e.target.value)} style={inputStyle} max={formatDate(new Date())} /></div>}
            <div style={{ paddingTop:14, borderTop:"1px solid #F0E8E0", marginBottom:12 }}>
              <label style={labelStyle}>Notifications</label>
              {notifStatus==="default" && <button onClick={() => Notification.requestPermission().then(setNotifStatus)} style={actionBtnStyle("#C4856A")}>Enable notifications</button>}
              {notifStatus==="granted" && <div style={{ fontSize:12, color:"#7BA57B" }}>✓ Enabled</div>}
              {notifStatus==="denied" && <div style={{ fontSize:12, color:"#C4856A" }}>Blocked in browser settings</div>}
            </div>
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
            <div style={{ paddingTop:14, borderTop:"1px solid #F0E8E0", marginBottom:12 }}>
              <button onClick={exportICS} style={actionBtnStyle("#7BA57B")}>↓ Download .ics (6 months)</button>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              <button onClick={logout} style={{ flex:1, padding:"10px", borderRadius:12, border:"1px solid #E0D0C8", background:"white", fontSize:12, color:"#B07060", cursor:"pointer" }}>Log out</button>
              <button onClick={saveSettings} style={{ flex:2, padding:"10px", borderRadius:12, border:"none", background:"#C4856A", color:"white", fontSize:13, fontWeight:600, cursor:"pointer" }}>Save & sync</button>
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* Hero */}
=======
        {/* Notif banner */}
        {notifStatus==="default" && !showSettings && (
          <div style={{ background:"#FFF8F0", border:"1px solid #E8C8A8", borderRadius:14, padding:"11px 14px", marginTop:14, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>🔔</span>
            <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:"#3D2B1F" }}>Enable reminders</div><div style={{ fontSize:11, color:"#A08070" }}>Get notified on change days</div></div>
            <button onClick={() => Notification.requestPermission().then(setNotifStatus)} style={{ background:"#C4856A", color:"white", border:"none", borderRadius:8, padding:"6px 11px", fontSize:12, cursor:"pointer", fontWeight:600 }}>Enable</button>
          </div>
        )}

        {/* Hero card */}
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
        <div style={{ background:`linear-gradient(135deg,${activePatch.color}30,${activePatch.color}10)`, border:`1.5px solid ${activePatch.color}66`, borderRadius:20, padding:"18px 20px", marginTop:16, boxShadow:`0 8px 28px ${activePatch.color}20` }}>
          <div style={{ fontSize:10, fontWeight:600, color:activePatch.color, letterSpacing:1.2, textTransform:"uppercase", marginBottom:8 }}>Currently wearing</div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:40 }}>{activePatch.emoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21, color:"#3D2B1F", fontWeight:700, lineHeight:1.1 }}>{activePatch.patch}</div>
              <div style={{ fontSize:12, color:"#7A6558", marginTop:3 }}>{activePatch.type} · Week {activePatch.week} of 4</div>
              <div style={{ fontSize:11, color:"#A08070", marginTop:2 }}>Patch #{activePatchSlot+1} of 8 · cycle day {cycleDay+1} of 28</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
<<<<<<< HEAD
              <div style={{ width:8, height:80, background:"#F0E8E0", borderRadius:4, position:"relative", overflow:"hidden" }}><div style={{ position:"absolute", bottom:0, left:0, right:0, background:activePatch.color, height:`${((cycleDay+1)/28)*100}%`, borderRadius:4 }} /></div>
=======
              <div style={{ width:8, height:80, background:"#F0E8E0", borderRadius:4, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, background:activePatch.color, height:`${((cycleDay+1)/28)*100}%`, borderRadius:4 }} />
              </div>
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
              <div style={{ fontSize:9, color:"#A08070", textAlign:"center" }}>cycle<br />progress</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginTop:18, background:"#F0E8E0", borderRadius:14, padding:4 }}>
<<<<<<< HEAD
          {[["today","Today"],["upcoming","Upcoming"],["calendar","Calendar"],["cycle","Cycle"]].map(([t,label])=>(
            <button key={t} onClick={()=>setTab(t)} style={{ flex:1, background:tab===t?"white":"none", border:"none", borderRadius:10, padding:"9px 2px", cursor:"pointer", fontSize:12, fontWeight:tab===t?600:400, color:tab===t?"#3D2B1F":"#9A8A7A", transition:"all 0.2s", boxShadow:tab===t?"0 2px 8px #00000012":"none" }}>{label}</button>
          ))}
        </div>

        {tab==="today"&&(
          <div style={{ marginTop:16 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, color:"#9A8A7A", marginBottom:10 }}>{today.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>
            {!todayPatch&&!todayTostran&&<div style={{ background:"white", borderRadius:16, padding:"26px 20px", textAlign:"center", border:"1px solid #EDE5DC" }}><div style={{ fontSize:34, marginBottom:8 }}>✨</div><div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:"#3D2B1F", fontWeight:600 }}>Nothing to do today</div><div style={{ fontSize:13, color:"#A08070", marginTop:5 }}>Rest day — no patch change or Tostran</div></div>}
            {todayPatch&&<DoseCard ev={todayPatch} done={completedDoses[todayPatch.id]} onToggle={()=>toggleDone(todayPatch.id)} gcalUrl={gcalUrl(todayPatch)} />}
            {todayTostran&&<DoseCard ev={todayTostran} done={completedDoses[todayTostran.id]} onToggle={()=>toggleDone(todayTostran.id)} gcalUrl={gcalUrl(todayTostran)} />}
=======
          {[["today","Today"],["upcoming","Upcoming"],["calendar","Calendar"],["cycle","Cycle"]].map(([t,label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1, background:tab===t?"white":"none", border:"none", borderRadius:10, padding:"9px 2px", cursor:"pointer", fontSize:12, fontWeight:tab===t?600:400, color:tab===t?"#3D2B1F":"#9A8A7A", transition:"all 0.2s", boxShadow:tab===t?"0 2px 8px #00000012":"none" }}>{label}</button>
          ))}
        </div>

        {/* TODAY */}
        {tab==="today" && (
          <div style={{ marginTop:16 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, color:"#9A8A7A", marginBottom:10 }}>{today.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>
            {!todayPatch && !todayTostran && <div style={{ background:"white", borderRadius:16, padding:"26px 20px", textAlign:"center", border:"1px solid #EDE5DC" }}><div style={{ fontSize:34, marginBottom:8 }}>✨</div><div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:"#3D2B1F", fontWeight:600 }}>Nothing to do today</div><div style={{ fontSize:13, color:"#A08070", marginTop:5 }}>Rest day — no patch change or Tostran</div></div>}
            {todayPatch && <DoseCard ev={todayPatch} done={completedDoses[todayPatch.id]} onToggle={() => toggleDone(todayPatch.id)} gcalUrl={gcalUrl(todayPatch)} />}
            {todayTostran && <DoseCard ev={todayTostran} done={completedDoses[todayTostran.id]} onToggle={() => toggleDone(todayTostran.id)} gcalUrl={gcalUrl(todayTostran)} />}
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
            <div style={{ background:"#F7F3FF", borderRadius:14, padding:"13px 15px", marginTop:14, border:"1px solid #E0D8F0" }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#7A6598", marginBottom:6 }}>💡 Tips</div>
              <div style={{ fontSize:12, color:"#7A6598", lineHeight:1.65 }}>Patches: clean, dry, hair-free skin on buttocks or abdomen. Rotate sites. Press 10 seconds. Tostran: inner thigh or abdomen, wash hands after.</div>
            </div>
          </div>
        )}
<<<<<<< HEAD
        {tab==="upcoming"&&(
          <div style={{ marginTop:16 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, color:"#9A8A7A", marginBottom:10 }}>Next 6 events</div>
            {upcoming.map(ev=>(
=======

        {/* UPCOMING */}
        {tab==="upcoming" && (
          <div style={{ marginTop:16 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, color:"#9A8A7A", marginBottom:10 }}>Next 6 events</div>
            {upcoming.map(ev => (
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
              <div key={ev.id} style={{ background:"white", borderRadius:14, padding:"13px 15px", marginBottom:8, border:"1px solid #EDE5DC", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:11, background:ev.color+"33", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{ev.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:"#3D2B1F" }}>{ev.label}{ev.patchNum&&<span style={{ fontSize:11, color:"#A08070", fontWeight:400 }}> (#{ev.patchNum}/8)</span>}</div>
                  <div style={{ fontSize:12, color:"#A08070", marginTop:2 }}>{ev.date.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}{ev.type==="patch"&&` · ${ev.patchType}`}</div>
                </div>
<<<<<<< HEAD
                <button onClick={()=>window.open(gcalUrl(ev),"_blank")} style={{ background:"none", border:"1px solid #E0D5CC", borderRadius:8, padding:"6px 8px", cursor:"pointer", fontSize:12, color:"#7A6558" }}>📅</button>
=======
                <button onClick={() => window.open(gcalUrl(ev),"_blank")} style={{ background:"none", border:"1px solid #E0D5CC", borderRadius:8, padding:"6px 8px", cursor:"pointer", fontSize:12, color:"#7A6558" }}>📅</button>
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
              </div>
            ))}
          </div>
        )}
<<<<<<< HEAD
        {tab==="calendar"&&(
          <div style={{ marginTop:16, background:"white", borderRadius:18, padding:18, border:"1px solid #EDE5DC" }}>
            <CalendarView patchEvents={patchEvents} tostranEvents={tostranEvents} viewDate={viewDate} setViewDate={setViewDate} />
            <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid #F0E8E0" }}><button onClick={exportICS} style={actionBtnStyle("#7BA57B")}>↓ Download .ics → import to Google / Apple Calendar</button></div>
          </div>
        )}
        {tab==="cycle"&&(
=======

        {/* CALENDAR */}
        {tab==="calendar" && (
          <div style={{ marginTop:16, background:"white", borderRadius:18, padding:18, border:"1px solid #EDE5DC" }}>
            <CalendarView patchEvents={patchEvents} tostranEvents={tostranEvents} viewDate={viewDate} setViewDate={setViewDate} />
            <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid #F0E8E0" }}>
              <button onClick={exportICS} style={actionBtnStyle("#7BA57B")}>↓ Download .ics → import to Google / Apple Calendar</button>
            </div>
          </div>
        )}

        {/* CYCLE */}
        {tab==="cycle" && (
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
          <div style={{ marginTop:16 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, color:"#9A8A7A", marginBottom:12 }}>8-patch Evorel Sequi cycle</div>
            <div style={{ background:"white", borderRadius:16, padding:16, border:"1px solid #EDE5DC", marginBottom:10 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:4, marginBottom:10 }}>
<<<<<<< HEAD
                {PATCHES.map(p=>{ const c=p.num===activePatchSlot+1; return <div key={p.num} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}><div style={{ width:"100%", height:6, borderRadius:3, background:p.color, opacity:c?1:0.4 }} /><div style={{ width:28, height:28, borderRadius:8, background:c?p.color+"30":"#F5F0EA", border:`${c?2:1}px solid ${c?p.color:"#E0D5CC"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:c?14:11, position:"relative" }}>{c?p.emoji:<span style={{ fontWeight:700, color:"#9A8070" }}>{p.num}</span>}{c&&<div style={{ position:"absolute", top:-4, right:-4, width:8, height:8, borderRadius:"50%", background:"#C4856A" }} />}</div><div style={{ fontSize:8, color:c?(p.num<=4?"#B07070":"#5A8A6A"):"#B0A090", textAlign:"center", fontWeight:c?700:400 }}>#{p.num}</div></div>; })}
=======
                {PATCHES.map(p => { const isCur=p.num===activePatchSlot+1; return <div key={p.num} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}><div style={{ width:"100%", height:6, borderRadius:3, background:p.color, opacity:isCur?1:0.4 }} /><div style={{ width:28, height:28, borderRadius:8, background:isCur?p.color+"30":"#F5F0EA", border:`${isCur?2:1}px solid ${isCur?p.color:"#E0D5CC"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:isCur?14:11, position:"relative" }}>{isCur?p.emoji:<span style={{ fontWeight:700, color:"#9A8070" }}>{p.num}</span>}{isCur&&<div style={{ position:"absolute", top:-4, right:-4, width:8, height:8, borderRadius:"50%", background:"#C4856A" }} />}</div><div style={{ fontSize:8, color:isCur?(p.num<=4?"#B07070":"#5A8A6A"):"#B0A090", textAlign:"center", fontWeight:isCur?700:400 }}>#{p.num}</div></div>; })}
              </div>
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:20, height:5, borderRadius:3, background:"#D4A5A5" }} /><span style={{ fontSize:11, color:"#8A7265" }}>🌸 Evorel 50 (1–4)</span></div>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:20, height:5, borderRadius:3, background:"#A5B8A5" }} /><span style={{ fontSize:11, color:"#8A7265" }}>🌿 Conti (5–8)</span></div>
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
              </div>
            </div>
            <div style={{ background:"white", borderRadius:16, padding:"15px 17px", border:"1px solid #EDE5DC", marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#3D2B1F", marginBottom:8 }}>Schedule</div>
<<<<<<< HEAD
              <div style={{ fontSize:13, color:"#7A6558", lineHeight:1.75 }}><div>📅 Changed <strong>twice per week</strong>, 3–4 days apart</div><div>🔁 8 patches per 28-day cycle, then repeats</div><div>🌸 Patches 1–4: Evorel 50 (oestrogen only)</div><div>🌿 Patches 5–8: Evorel Conti (oestrogen + progesterone)</div></div>
            </div>
            {tostranStartDate&&<div style={{ background:"#F7F0FF", borderRadius:16, padding:"15px 17px", border:"1px solid #E0D5F0" }}><div style={{ fontSize:13, fontWeight:600, color:"#6B5A8A", marginBottom:8 }}>💜 Tostran</div><div style={{ fontSize:13, color:"#7A6598", lineHeight:1.75 }}><div>⏱ Every other day</div><div>📍 Inner thigh or lower abdomen</div><div>🖐 Wash hands after · cover until dry</div></div></div>}
=======
              <div style={{ fontSize:13, color:"#7A6558", lineHeight:1.75 }}>
                <div>📅 Changed <strong>twice per week</strong>, 3–4 days apart</div>
                <div>🔁 8 patches per 28-day cycle, then repeats</div>
                <div>🌸 Patches 1–4: Evorel 50 (oestrogen only)</div>
                <div>🌿 Patches 5–8: Evorel Conti (oestrogen + progesterone)</div>
              </div>
            </div>
            {tostranStartDate && <div style={{ background:"#F7F0FF", borderRadius:16, padding:"15px 17px", border:"1px solid #E0D5F0" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#6B5A8A", marginBottom:8 }}>💜 Tostran</div>
              <div style={{ fontSize:13, color:"#7A6598", lineHeight:1.75 }}><div>⏱ Every other day</div><div>📍 Inner thigh or lower abdomen</div><div>🖐 Wash hands after · cover until dry</div></div>
            </div>}
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
          </div>
        )}
      </div>
    </div>
  );
}

<<<<<<< HEAD
const labelStyle  = { display:"block", fontSize:12, fontWeight:600, color:"#8A7265", marginBottom:6, letterSpacing:0.3 };
const inputStyle  = { width:"100%", padding:"9px 12px", border:"1px solid #E0D5CC", borderRadius:10, fontSize:14, color:"#3D2B1F", background:"#FDFAF7", boxSizing:"border-box", outline:"none" };
const navBtnStyle = { background:"none", border:"1px solid #E0D5CC", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:18, color:"#8A7265", display:"flex", alignItems:"center", justifyContent:"center" };
=======
const labelStyle    = { display:"block", fontSize:12, fontWeight:600, color:"#8A7265", marginBottom:6, letterSpacing:0.3 };
const inputStyle    = { width:"100%", padding:"9px 12px", border:"1px solid #E0D5CC", borderRadius:10, fontSize:14, color:"#3D2B1F", background:"#FDFAF7", boxSizing:"border-box", outline:"none" };
const navBtnStyle   = { background:"none", border:"1px solid #E0D5CC", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:18, color:"#8A7265", display:"flex", alignItems:"center", justifyContent:"center" };
>>>>>>> 0db771e1bb13a9b553323ace8d791b2ee366718c
function actionBtnStyle(color) { return { display:"block", width:"100%", background:color, color:"white", border:"none", borderRadius:10, padding:"10px", cursor:"pointer", fontSize:13, fontWeight:600, margin:"4px 0 0", textAlign:"center" }; }
