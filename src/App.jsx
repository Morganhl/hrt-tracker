import { useState, useEffect, useRef } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL      = "https://qwafwokfrakhlqqbuesv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3YWZ3b2tmcmFraGxxcWJ1ZXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzY0MjMsImV4cCI6MjA5NDkxMjQyM30.iSp5d-EQC0bRE8JazvdnMEGfHz6v7FxgHsL8foYtzOg";
const VAPID_PUBLIC_KEY  = "BNbly2PMHy9CMehr0BFOQ77AtrQeVZDcmjUi8JQMhuj-f8K4SZ1BuPVRB_BTzvmgcoCHJU6usRbyjSLV7yGed3E";

const SB = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" };
async function sbGet(uid) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/hrt_data?user_id=eq.${encodeURIComponent(uid)}&select=data`, { headers: SB });
  const rows = await r.json(); return rows?.[0]?.data || null;
}
async function sbUpsert(uid, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/hrt_data`, {
    method: "POST",
    headers: {
      ...SB,
      Prefer: "resolution=merge-duplicates",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user_id: uid, data, updated_at: new Date().toISOString() })
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("sbUpsert failed:", res.status, err);
    throw new Error(`Save failed: ${res.status} ${err}`);
  }
  return res;
}
async function sbSavePushSub(uid, sub) {
  await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
    method:"POST", headers:{...SB, Prefer:"resolution=merge-duplicates"},
    body: JSON.stringify({ user_id:uid, subscription:sub })
  });
}

// ─── Push ─────────────────────────────────────────────────────────────────────
function urlB64ToUint8(b64) {
  const pad = "=".repeat((4 - b64.length%4)%4);
  const raw = atob((b64+pad).replace(/-/g,"+").replace(/_/g,"/"));
  return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));
}
async function subscribeToPush(uid) {
  if(!("serviceWorker" in navigator)||!("PushManager" in window)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if(!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:urlB64ToUint8(VAPID_PUBLIC_KEY) });
    await sbSavePushSub(uid, sub.toJSON()); return true;
  } catch(e) { console.error(e); return false; }
}
async function unsubscribeFromPush() {
  if(!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if(sub) { await sub.unsubscribe(); }
}

// ─── Patch data ───────────────────────────────────────────────────────────────
const PATCH_CHANGE_DAYS = [0,3,7,10,14,17,21,24];
const PATCHES = [
  {num:1,patch:"Evorel 50",   type:"oestrogen only",           week:1,color:"#D4A5A5",emoji:"🌸"},
  {num:2,patch:"Evorel 50",   type:"oestrogen only",           week:1,color:"#D4A5A5",emoji:"🌸"},
  {num:3,patch:"Evorel 50",   type:"oestrogen only",           week:2,color:"#D4A5A5",emoji:"🌸"},
  {num:4,patch:"Evorel 50",   type:"oestrogen only",           week:2,color:"#D4A5A5",emoji:"🌸"},
  {num:5,patch:"Evorel Conti",type:"oestrogen + progesterone", week:3,color:"#A5B8A5",emoji:"🌿"},
  {num:6,patch:"Evorel Conti",type:"oestrogen + progesterone", week:3,color:"#A5B8A5",emoji:"🌿"},
  {num:7,patch:"Evorel Conti",type:"oestrogen + progesterone", week:4,color:"#A5B8A5",emoji:"🌿"},
  {num:8,patch:"Evorel Conti",type:"oestrogen + progesterone", week:4,color:"#A5B8A5",emoji:"🌿"},
];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmtDate(d) { return d.toISOString().split("T")[0]; }
function addDays(d,n) { const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function isSameDay(a,b) { return fmtDate(a)===fmtDate(b); }
function calcCycleStart(patchNum,appliedDate) { return addDays(appliedDate,-PATCH_CHANGE_DAYS[patchNum-1]); }
function getActivePatch(cycleStart) {
  const cd = ((Math.floor((new Date()-cycleStart)/86400000)%28)+28)%28;
  let slot=0; for(let i=PATCH_CHANGE_DAYS.length-1;i>=0;i--){if(cd>=PATCH_CHANGE_DAYS[i]){slot=i;break;}}
  return {patch:PATCHES[slot],cycleDay:cd,slot};
}
function generatePatchSchedule(cycleStart,n=6) {
  const evs=[];
  for(let c=0;c<n;c++) PATCHES.forEach((p,i)=>evs.push({
    id:`patch-${c}-${p.num}`,type:"patch",date:addDays(cycleStart,c*28+PATCH_CHANGE_DAYS[i]),
    patch:p.patch,patchType:p.type,color:p.color,emoji:p.emoji,week:p.week,patchNum:p.num,label:`Change to ${p.patch}`
  }));
  return evs;
}
function generateTostranSchedule(start,days=180) {
  const evs=[];
  for(let i=0;i<days;i+=2) evs.push({id:`tos-${i}`,type:"tostran",date:addDays(start,i),label:"Apply Tostran gel",color:"#C4B5D4",emoji:"💜"});
  return evs;
}

// ─── Period schedule ──────────────────────────────────────────────────────────
function generatePeriodSchedule(lastPeriodDate, cycleLength, periodLogs, months=6) {
  if(!lastPeriodDate||!cycleLength) return [];
  const evs=[];
  // Find the most recent actual log to base predictions from
  const sortedLogs = [...(periodLogs||[])].sort((a,b)=>new Date(b)-new Date(a));
  const baseDate = sortedLogs.length>0 ? new Date(sortedLogs[0]+"T12:00:00") : new Date(lastPeriodDate+"T12:00:00");
  const totalDays = months*30;
  // Past periods from lastPeriodDate
  let d = new Date(lastPeriodDate+"T12:00:00");
  const today = new Date();
  // go back to find start
  while(addDays(d, cycleLength) < addDays(today, -cycleLength*2)) d = addDays(d, cycleLength);
  // generate forward
  for(let i=0;i<totalDays;i+=cycleLength) {
    const periodDate = addDays(baseDate, i);
    const isLogged = (periodLogs||[]).some(l=>isSameDay(new Date(l+"T12:00:00"),periodDate));
    evs.push({
      id:`period-${fmtDate(periodDate)}`,
      type:"period",
      date:periodDate,
      label:isLogged?"Period (logged)":"Period (predicted)",
      color:"#E88080",
      emoji:"🔴",
      isLogged,
      isPredicted:!isLogged,
    });
    // also go backwards from base
    const past = addDays(baseDate,-i);
    if(i>0 && past >= addDays(today,-180)) {
      const isPastLogged = (periodLogs||[]).some(l=>isSameDay(new Date(l+"T12:00:00"),past));
      evs.push({
        id:`period-past-${fmtDate(past)}`,
        type:"period",
        date:past,
        label:isPastLogged?"Period (logged)":"Period (predicted)",
        color:"#E88080",
        emoji:"🔴",
        isLogged:isPastLogged,
        isPredicted:!isPastLogged,
      });
    }
  }
  return evs.filter((e,i,arr)=>arr.findIndex(x=>x.id===e.id)===i).sort((a,b)=>a.date-b.date);
}

function generateICS(patchEvents,tostranEvents,periodEvents) {
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//HRT Tracker//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH"];
  [...patchEvents,...tostranEvents,...(periodEvents||[])].forEach(ev=>{
    const d=ev.date,dt=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    const n=addDays(d,1),dt2=`${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}${String(n.getDate()).padStart(2,"0")}`;
    lines.push("BEGIN:VEVENT",`UID:${ev.id}@hrt`,`DTSTART;VALUE=DATE:${dt}`,`DTEND;VALUE=DATE:${dt2}`,
      `SUMMARY:${ev.emoji} ${ev.label}`,"BEGIN:VALARM","TRIGGER:-PT30M","ACTION:DISPLAY",`DESCRIPTION:${ev.label}`,"END:VALARM","END:VEVENT");
  });
  lines.push("END:VCALENDAR"); return lines.join("\r\n");
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const cached = localStorage.getItem("hrt_userId")||"";
  // switchName is only used when typing a different name
  const [switchName,setSwitchName] = useState("");
  const [loading,setLoading]       = useState(false);
  const [loadingSwitch,setLoadingSwitch] = useState(false);
  const [error,setError]           = useState("");
  const isReturning                = !!cached;
  const displayName                = cached.charAt(0).toUpperCase()+cached.slice(1);

  // Continue as cached user
  async function handleContinue() {
    setLoading(true); setError("");
    try {
      const data = await sbGet(cached);
      onLogin(cached, data);
    } catch { setError("Couldn't connect — check your internet"); }
    setLoading(false);
  }

  // Sign in as a different (possibly new) person
  async function handleSwitch() {
    const uid = switchName.trim().toLowerCase();
    if(!uid){ setError("Please enter a name"); return; }
    setLoadingSwitch(true); setError("");
    try {
      const data = await sbGet(uid);
      // data will be null for brand new users — handleLogin in main app handles that
      onLogin(uid, data);
    } catch { setError("Couldn't connect — check your internet"); }
    setLoadingSwitch(false);
  }

  // New user (no cached name)
  async function handleNew() {
    const uid = switchName.trim().toLowerCase();
    if(!uid){ setError("Please enter your name"); return; }
    setLoading(true); setError("");
    try {
      const data = await sbGet(uid);
      onLogin(uid, data);
    } catch { setError("Couldn't connect — check your internet"); }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#FDF6F0,#F5EDE8,#EDE8F5)",fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <div style={{fontSize:52,marginBottom:12}}>🌸</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,color:"#3D2B1F",fontWeight:700,marginBottom:24}}>HRT Tracker</div>

      <div style={{width:"100%",maxWidth:340}}>
        {isReturning ? (
          <div>
            {/* Welcome back banner */}
            <div style={{background:"#F0FFF4",border:"1px solid #A5C4A5",borderRadius:16,padding:"20px",marginBottom:24,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>👋</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,color:"#3D2B1F",fontWeight:600,marginBottom:6}}>
                Welcome back, {displayName}!
              </div>
              <div style={{fontSize:13,color:"#6A8A6A",marginBottom:16,lineHeight:1.5}}>
                Your saved profile will load automatically.
              </div>
              <button onClick={handleContinue} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:loading?"#B0C8B0":"#6BA57B",color:"white",fontSize:15,fontWeight:600,cursor:loading?"default":"pointer"}}>
                {loading ? "Loading your profile…" : `Continue as ${displayName} →`}
              </button>
            </div>

            {/* Different user section */}
            <div style={{background:"white",borderRadius:14,padding:"16px",border:"1px solid #EDE5DC"}}>
              <div style={{fontSize:13,fontWeight:600,color:"#7A6558",marginBottom:10}}>Different person?</div>
              <div style={{fontSize:12,color:"#A08070",marginBottom:10,lineHeight:1.5}}>
                Enter another name — existing profiles load automatically, new names start setup.
              </div>
              <input
                value={switchName}
                onChange={e=>setSwitchName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSwitch()}
                placeholder="Enter name…"
                style={{...inp,fontSize:15,padding:"11px 14px",marginBottom:10}}
              />
              <button
                onClick={handleSwitch}
                disabled={loadingSwitch||!switchName.trim()}
                style={{width:"100%",padding:"11px",borderRadius:10,border:"none",background:loadingSwitch||!switchName.trim()?"#E0D5CC":"#C4856A",color:"white",fontSize:13,fontWeight:600,cursor:loadingSwitch||!switchName.trim()?"default":"pointer"}}
              >
                {loadingSwitch ? "Loading…" : "Continue →"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{fontSize:14,color:"#A08070",marginBottom:24,textAlign:"center",lineHeight:1.6}}>
              Enter your name to load your saved profile or create a new one.
              Your partner uses their own name for a separate profile.
            </div>
            <label style={lbl}>Your first name</label>
            <input
              value={switchName}
              onChange={e=>setSwitchName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleNew()}
              placeholder="e.g. Morgan"
              style={{...inp,fontSize:16,padding:"13px 16px",marginBottom:16}}
              autoFocus
            />
            <button onClick={handleNew} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:loading?"#E0D5CC":"#C4856A",color:"white",fontSize:15,fontWeight:600,cursor:loading?"default":"pointer"}}>
              {loading ? "Loading…" : "Continue →"}
            </button>
          </div>
        )}

        {error && <div style={{fontSize:13,color:"#C4856A",marginTop:12}}>⚠ {error}</div>}
      </div>
    </div>
  );
}

// ─── Setup Wizard ─────────────────────────────────────────────────────────────
function SetupWizard({onComplete, existingData}) {
  // Pre-fill from existing data if available (returning user / app rebuild)
  const hasExisting = !!(existingData?.patchNum);
  const [step,setStep]=useState(1);
  const [selectedPatch,setSelectedPatch]=useState(existingData?.patchNum||null);
  const [appliedDate,setAppliedDate]=useState(existingData?.patchAppliedDate||fmtDate(new Date()));
  const [tostranDate,setTostranDate]=useState(existingData?.tostranStartDate||fmtDate(new Date()));
  const [trackTostran,setTrackTostran]=useState(existingData?.tostranStartDate?true:true);
  const [trackPeriod,setTrackPeriod]=useState(!!(existingData?.lastPeriodDate));
  const [lastPeriod,setLastPeriod]=useState(existingData?.lastPeriodDate||fmtDate(new Date()));
  const [cycleLength,setCycleLength]=useState(existingData?.cycleLength?String(existingData.cycleLength):"28");

  function finish() {
    onComplete({
      patchNum:selectedPatch, appliedDate:new Date(appliedDate+"T12:00:00"),
      tostranDate:trackTostran?new Date(tostranDate+"T12:00:00"):null,
      lastPeriodDate:trackPeriod?lastPeriod:null, cycleLength:trackPeriod?parseInt(cycleLength):null,
      periodLogs:existingData?.periodLogs||[]
    });
  }

  function skipWithSaved() {
    onComplete({
      patchNum:existingData.patchNum,
      appliedDate:new Date(existingData.patchAppliedDate+"T12:00:00"),
      tostranDate:existingData.tostranStartDate?new Date(existingData.tostranStartDate+"T12:00:00"):null,
      lastPeriodDate:existingData.lastPeriodDate||null,
      cycleLength:existingData.cycleLength||28,
      periodLogs:existingData.periodLogs||[]
    });
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#FDF6F0,#F5EDE8,#EDE8F5)",fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <div style={{padding:"28px 24px 0",textAlign:"center"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:"#3D2B1F",fontWeight:700}}>Set up your schedule</div>
        <div style={{fontSize:13,color:"#A08070",marginTop:4}}>Just a few quick questions</div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:20}}>
        {[1,2,3,4].map(s=><div key={s} style={{width:s===step?24:8,height:8,borderRadius:4,background:s===step?"#C4856A":s<step?"#A5B8A5":"#E0D5CC",transition:"all 0.3s"}}/>)}
      </div>
      <div style={{flex:1,padding:"24px 20px 32px",maxWidth:480,margin:"0 auto",width:"100%"}}>

        {/* Step 1 — patch picker */}
        {step===1&&<div>

          {/* Skip banner for returning users */}
          {hasExisting&&(()=>{const p=PATCHES[existingData.patchNum-1]; return(
            <div style={{background:"#F0FFF4",border:"1px solid #A5C4A5",borderRadius:14,padding:"14px 16px",marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:600,color:"#5A8A6A",marginBottom:4}}>✓ Saved profile found</div>
              <div style={{fontSize:12,color:"#5A7A6A",marginBottom:10,lineHeight:1.5}}>
                Last saved: <strong>{p.emoji} Patch #{existingData.patchNum} — {p.patch}</strong><br/>
                Applied: <strong>{new Date(existingData.patchAppliedDate+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</strong>
              </div>
              <button onClick={skipWithSaved} style={{width:"100%",padding:"11px",borderRadius:10,border:"none",background:"#6BA57B",color:"white",fontSize:14,fontWeight:600,cursor:"pointer"}}>
                ✓ Continue with saved settings
              </button>
              <div style={{textAlign:"center",marginTop:8,fontSize:12,color:"#8A9A8A"}}>or update below if your patch has changed</div>
            </div>
          );})()}

          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#3D2B1F",fontWeight:700,marginBottom:6}}>Which patch are you on?</div>
          <div style={{fontSize:13,color:"#8A7265",marginBottom:20,lineHeight:1.5}}>Select the patch you're <strong>currently wearing</strong>.</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
            {PATCHES.map(p=>{const s=selectedPatch===p.num;return(
              <button key={p.num} onClick={()=>setSelectedPatch(p.num)} style={{border:`2px solid ${s?p.color:"#E0D5CC"}`,borderRadius:14,padding:"14px 4px 10px",cursor:"pointer",background:s?p.color+"20":"white",transition:"all 0.2s",boxShadow:s?`0 4px 14px ${p.color}44`:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <span style={{fontSize:22}}>{p.emoji}</span>
                <span style={{fontSize:16,fontWeight:700,color:s?(p.num<=4?"#B07070":"#5A8A6A"):"#3D2B1F"}}>#{p.num}</span>
                <span style={{fontSize:9,color:"#9A8070",textAlign:"center"}}>{p.num<=4?"Evorel 50":"Conti"}</span>
                <span style={{fontSize:9,color:"#B0A090"}}>Wk {p.week}</span>
              </button>
            );})}
          </div>
          {selectedPatch&&(()=>{const p=PATCHES[selectedPatch-1];return<div style={{background:p.color+"18",border:`1px solid ${p.color}55`,borderRadius:12,padding:"12px 14px",marginBottom:20,fontSize:13,color:"#5A4A3A",lineHeight:1.6}}><strong>{p.emoji} Patch #{p.num} — {p.patch}</strong><br/>{p.type} · Week {p.week}</div>;})()}
          <button onClick={()=>selectedPatch&&setStep(2)} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:selectedPatch?"#C4856A":"#E0D5CC",color:selectedPatch?"white":"#A09080",fontSize:15,fontWeight:600,cursor:selectedPatch?"pointer":"default"}}>Continue →</button>
          <div style={{textAlign:"center",marginTop:14}}><button onClick={()=>onComplete({patchNum:1,appliedDate:new Date(),tostranDate:new Date(),lastPeriodDate:null,cycleLength:null,periodLogs:[]})} style={{background:"none",border:"none",fontSize:12,color:"#A08070",cursor:"pointer",textDecoration:"underline"}}>Starting fresh (patch #1 today)</button></div>
        </div>}

        {/* Step 2 — patch date */}
        {step===2&&selectedPatch&&(()=>{
          const p=PATCHES[selectedPatch-1];
          const preview=calcCycleStart(selectedPatch,new Date(appliedDate+"T12:00:00"));
          return<div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#3D2B1F",fontWeight:700,marginBottom:6}}>When did you apply patch #{selectedPatch}?</div>
            <div style={{background:p.color+"15",border:`1px solid ${p.color}44`,borderRadius:12,padding:"12px 14px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24}}>{p.emoji}</span>
              <div style={{fontSize:13,color:"#5A4A3A"}}><strong>Patch #{p.num} — {p.patch}</strong><br/><span style={{fontSize:11,color:"#9A8070"}}>{p.type}</span></div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {["Today","Yesterday"].map(label=>{const val=fmtDate(label==="Today"?new Date():addDays(new Date(),-1));return<button key={label} onClick={()=>setAppliedDate(val)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${appliedDate===val?"#C4856A":"#E0D5CC"}`,background:appliedDate===val?"#FFF0E8":"white",fontSize:13,fontWeight:600,color:appliedDate===val?"#C4856A":"#7A6558",cursor:"pointer"}}>{label}</button>;})}
            </div>
            <label style={lbl}>Or pick a date:</label>
            <input type="date" value={appliedDate} onChange={e=>setAppliedDate(e.target.value)} style={inp} max={fmtDate(new Date())}/>
            <div style={{background:"#F7F9F7",border:"1px solid #D5E5D5",borderRadius:10,padding:"10px 14px",marginTop:12,fontSize:12,color:"#6A8A6A"}}>📅 Cycle start: <strong>{preview.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</strong></div>
            <div style={{display:"flex",gap:8,marginTop:20}}>
              <button onClick={()=>setStep(1)} style={{flex:1,padding:"13px",borderRadius:14,border:"1px solid #E0D5CC",background:"white",fontSize:14,color:"#7A6558",cursor:"pointer"}}>← Back</button>
              <button onClick={()=>setStep(3)} style={{flex:2,padding:"13px",borderRadius:14,border:"none",background:"#C4856A",color:"white",fontSize:14,fontWeight:600,cursor:"pointer"}}>Continue →</button>
            </div>
          </div>;
        })()}

        {/* Step 3 — Tostran */}
        {step===3&&<div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#3D2B1F",fontWeight:700,marginBottom:6}}>Tostran gel?</div>
          <div style={{fontSize:13,color:"#8A7265",marginBottom:20}}>Do you also want to track Tostran? Applied every other day.</div>
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            {[["Yes, track it",true],["No thanks",false]].map(([label,val])=><button key={String(val)} onClick={()=>setTrackTostran(val)} style={{flex:1,padding:"12px",borderRadius:12,border:`2px solid ${trackTostran===val?"#C4B5D4":"#E0D5CC"}`,background:trackTostran===val?"#F5F0FF":"white",fontSize:13,fontWeight:600,color:trackTostran===val?"#7A5A9A":"#7A6558",cursor:"pointer"}}>{label}</button>)}
          </div>
          {trackTostran&&<div>
            <div style={{background:"#F5F0FF",border:"1px solid #D5C8F0",borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:12,color:"#6A5A8A",lineHeight:1.5}}>💜 Set the date of your <strong>most recent</strong> application.</div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {["Today","Yesterday"].map(label=>{const val=fmtDate(label==="Today"?new Date():addDays(new Date(),-1));return<button key={label} onClick={()=>setTostranDate(val)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${tostranDate===val?"#C4B5D4":"#E0D5CC"}`,background:tostranDate===val?"#F5F0FF":"white",fontSize:13,fontWeight:600,color:tostranDate===val?"#7A5A9A":"#7A6558",cursor:"pointer"}}>{label}</button>;})}
            </div>
            <label style={lbl}>Or pick a date:</label>
            <input type="date" value={tostranDate} onChange={e=>setTostranDate(e.target.value)} style={inp} max={fmtDate(new Date())}/>
          </div>}
          <div style={{display:"flex",gap:8,marginTop:24}}>
            <button onClick={()=>setStep(2)} style={{flex:1,padding:"13px",borderRadius:14,border:"1px solid #E0D5CC",background:"white",fontSize:14,color:"#7A6558",cursor:"pointer"}}>← Back</button>
            <button onClick={()=>setStep(4)} style={{flex:2,padding:"13px",borderRadius:14,border:"none",background:"#C4856A",color:"white",fontSize:14,fontWeight:600,cursor:"pointer"}}>Continue →</button>
          </div>
        </div>}

        {/* Step 4 — Period tracking */}
        {step===4&&<div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#3D2B1F",fontWeight:700,marginBottom:6}}>Track your period? 🔴</div>
          <div style={{fontSize:13,color:"#8A7265",marginBottom:20,lineHeight:1.5}}>We'll predict your period dates on the calendar and let you log actual dates to keep the schedule accurate.</div>
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            {[["Yes, track it",true],["No thanks",false]].map(([label,val])=><button key={String(val)} onClick={()=>setTrackPeriod(val)} style={{flex:1,padding:"12px",borderRadius:12,border:`2px solid ${trackPeriod===val?"#E88080":"#E0D5CC"}`,background:trackPeriod===val?"#FFF0F0":"white",fontSize:13,fontWeight:600,color:trackPeriod===val?"#C06060":"#7A6558",cursor:"pointer"}}>{label}</button>)}
          </div>
          {trackPeriod&&<div>
            <label style={lbl}>First day of your last period</label>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {["Today","Yesterday"].map(label=>{const val=fmtDate(label==="Today"?new Date():addDays(new Date(),-1));return<button key={label} onClick={()=>setLastPeriod(val)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${lastPeriod===val?"#E88080":"#E0D5CC"}`,background:lastPeriod===val?"#FFF0F0":"white",fontSize:13,fontWeight:600,color:lastPeriod===val?"#C06060":"#7A6558",cursor:"pointer"}}>{label}</button>;})}
            </div>
            <input type="date" value={lastPeriod} onChange={e=>setLastPeriod(e.target.value)} style={inp} max={fmtDate(new Date())}/>
            <label style={{...lbl,marginTop:14}}>Average cycle length (days)</label>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              {["21","24","28","30","35"].map(d=><button key={d} onClick={()=>setCycleLength(d)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${cycleLength===d?"#E88080":"#E0D5CC"}`,background:cycleLength===d?"#FFF0F0":"white",fontSize:13,fontWeight:600,color:cycleLength===d?"#C06060":"#7A6558",cursor:"pointer"}}>{d}</button>)}
            </div>
            <input type="number" value={cycleLength} onChange={e=>setCycleLength(e.target.value)} min="15" max="60" placeholder="Custom days" style={inp}/>
          </div>}
          <div style={{display:"flex",gap:8,marginTop:24}}>
            <button onClick={()=>setStep(3)} style={{flex:1,padding:"13px",borderRadius:14,border:"1px solid #E0D5CC",background:"white",fontSize:14,color:"#7A6558",cursor:"pointer"}}>← Back</button>
            <button onClick={finish} style={{flex:2,padding:"13px",borderRadius:14,border:"none",background:"#C4856A",color:"white",fontSize:15,fontWeight:600,cursor:"pointer"}}>Start tracking 🌸</button>
          </div>
        </div>}
      </div>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function CalendarView({patchEvents,tostranEvents,periodEvents,viewDate,setViewDate,onLogPeriod}) {
  const year=viewDate.getFullYear(),month=viewDate.getMonth();
  const firstDay=new Date(year,month,1).getDay(),daysInMonth=new Date(year,month+1,0).getDate();
  const today=new Date();
  const all=[...patchEvents,...tostranEvents,...(periodEvents||[])];
  function evs(day){const d=new Date(year,month,day);return all.filter(e=>isSameDay(e.date,d));}
  const cells=[];for(let i=0;i<firstDay;i++)cells.push(null);for(let d=1;d<=daysInMonth;d++)cells.push(d);
  const [selectedDay,setSelectedDay]=useState(null);

  function handleDayClick(day) {
    const d=new Date(year,month,day);
    const hasPeriod=evs(day).some(e=>e.type==="period");
    if(hasPeriod||d<=today) setSelectedDay(day===selectedDay?null:day);
  }

  return(<div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
      <button onClick={()=>setViewDate(new Date(year,month-1,1))} style={navBtn}>‹</button>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,color:"#3D2B1F",fontWeight:700}}>{MONTH_NAMES[month]} {year}</div>
      <button onClick={()=>setViewDate(new Date(year,month+1,1))} style={navBtn}>›</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
      {DAY_NAMES.map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:"#A08070",fontWeight:600,padding:"3px 0"}}>{d}</div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
      {cells.map((day,i)=>{
        if(!day)return<div key={`e-${i}`}/>;
        const ev=evs(day),isT=isSameDay(new Date(year,month,day),today),isSel=selectedDay===day;
        const hasPeriod=ev.some(e=>e.type==="period");
        return(
          <div key={day} onClick={()=>handleDayClick(day)} style={{minHeight:52,background:isSel?"#FFF0E8":isT?"#F5EDE8":"#FDFAF7",border:isSel?"2px solid #C4856A":isT?"2px solid #C4856A":"1px solid #EDE5DC",borderRadius:9,padding:"3px 4px",cursor:hasPeriod||new Date(year,month,day)<=today?"pointer":"default"}}>
            <div style={{fontSize:11,color:isT?"#C4856A":"#7A6558",fontWeight:isT?700:400,marginBottom:2}}>{day}</div>
            {ev.map(e=><div key={e.id} title={e.label} style={{background:e.type==="period"&&e.isPredicted?e.color+"88":e.color,borderRadius:3,padding:"1px 3px",fontSize:9,color:"#fff",marginBottom:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontWeight:600,border:e.type==="period"&&e.isPredicted?"1px dashed #fff":"none"}}>
              {e.emoji} {e.type==="patch"?`#${e.patchNum} ${e.patch.replace("Evorel ","")}`
                :e.type==="tostran"?"Tos"
                :e.isLogged?"Period":"~Period"}
            </div>)}
          </div>
        );
      })}
    </div>

    {/* Day popup */}
    {selectedDay&&(()=>{
      const d=new Date(year,month,selectedDay);
      const dayEvs=evs(selectedDay);
      const periodEv=dayEvs.find(e=>e.type==="period");
      return(
        <div style={{background:"#FFF8F4",border:"1px solid #E8C8A8",borderRadius:14,padding:"14px 16px",marginTop:12}}>
          <div style={{fontWeight:600,color:"#3D2B1F",fontSize:14,marginBottom:8}}>
            {d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}
          </div>
          {periodEv&&<div style={{marginBottom:8}}>
            <div style={{fontSize:13,color:"#C06060",marginBottom:6}}>🔴 {periodEv.label}</div>
            {periodEv.isPredicted&&d<=today&&<button onClick={()=>{onLogPeriod(fmtDate(d));setSelectedDay(null);}} style={{width:"100%",padding:"9px",borderRadius:10,border:"none",background:"#E88080",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              Log period on this date ✓
            </button>}
            {periodEv.isLogged&&<div style={{fontSize:12,color:"#7BA57B"}}>✓ Logged — future predictions based on this date</div>}
          </div>}
          {!periodEv&&d<=today&&<button onClick={()=>{onLogPeriod(fmtDate(d));setSelectedDay(null);}} style={{width:"100%",padding:"9px",borderRadius:10,border:"1px solid #E88080",background:"white",color:"#C06060",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            🔴 Log period on this date
          </button>}
        </div>
      );
    })()}

    {/* Legend */}
    <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
      {[{color:"#D4A5A5",emoji:"🌸",label:"Evorel 50"},{color:"#A5B8A5",emoji:"🌿",label:"Conti"},{color:"#C4B5D4",emoji:"💜",label:"Tostran"},{color:"#E88080",emoji:"🔴",label:"Period"}].map(l=>(
        <div key={l.label} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:2,background:l.color}}/><span style={{fontSize:11,color:"#8A7265"}}>{l.emoji} {l.label}</span></div>
      ))}
    </div>
  </div>);
}

// ─── Dose Card ────────────────────────────────────────────────────────────────
function DoseCard({ev,done,onToggle,gcUrl}) {
  return(
    <div style={{background:done?"#F7FBF7":"white",borderRadius:16,padding:"16px 18px",marginBottom:10,border:`1.5px solid ${done?"#A5C4A5":ev.color+"88"}`,boxShadow:done?"none":`0 4px 16px ${ev.color}22`,transition:"all 0.3s"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{width:46,height:46,borderRadius:13,background:done?"#E8F5E8":ev.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{done?"✅":ev.emoji}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:done?"#7A9A7A":"#3D2B1F",fontWeight:600,textDecoration:done?"line-through":"none"}}>
            {ev.label}{ev.patchNum&&<span style={{fontSize:12,fontWeight:400,color:"#A08070"}}> (#{ev.patchNum} of 8)</span>}
          </div>
          <div style={{fontSize:12,color:"#A08070",marginTop:3}}>{ev.type==="patch"?`${ev.patchType} · Week ${ev.week} of cycle`:"Every other day — inner thigh or abdomen"}</div>
        </div>
        <button onClick={()=>window.open(gcUrl,"_blank")} title="Add to Google Calendar" style={{background:"none",border:"1px solid #E0D5CC",borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:13,color:"#7A6558",flexShrink:0}}>📅</button>
      </div>
      <button onClick={onToggle} style={{marginTop:12,width:"100%",background:done?"#E8F5E8":ev.color,color:done?"#5A8A5A":"white",border:"none",borderRadius:10,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.2s"}}>
        {done?"✓ Done — tap to undo":"Mark as done"}
      </button>
    </div>
  );
}

// ─── Period log button ────────────────────────────────────────────────────────
function LogPeriodCard({onLog}) {
  const [expanded,setExpanded]=useState(false);
  const [date,setDate]=useState(fmtDate(new Date()));
  return(
    <div style={{background:"#FFF5F5",border:"1px solid #F0C0C0",borderRadius:16,padding:"14px 16px",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>🔴</span>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:"#3D2B1F"}}>Log period</div>
            <div style={{fontSize:12,color:"#A08070"}}>Override predicted date</div>
          </div>
        </div>
        <button onClick={()=>setExpanded(!expanded)} style={{background:"#E88080",color:"white",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>
          {expanded?"Cancel":"Log"}
        </button>
      </div>
      {expanded&&<div style={{marginTop:12}}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {["Today","Yesterday"].map(label=>{const val=fmtDate(label==="Today"?new Date():addDays(new Date(),-1));return<button key={label} onClick={()=>setDate(val)} style={{flex:1,padding:"9px",borderRadius:10,border:`2px solid ${date===val?"#E88080":"#E0D5CC"}`,background:date===val?"#FFF0F0":"white",fontSize:12,fontWeight:600,color:date===val?"#C06060":"#7A6558",cursor:"pointer"}}>{label}</button>;})}
        </div>
        <label style={lbl}>Or pick a date:</label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp} max={fmtDate(new Date())}/>
        <button onClick={()=>{onLog(date);setExpanded(false);}} style={{marginTop:10,width:"100%",padding:"10px",borderRadius:10,border:"none",background:"#E88080",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          ✓ Confirm period on {new Date(date+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
        </button>
      </div>}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function HRTTracker() {
  const [userId,setUserId]         = useState(null); // always start null — login screen handles cached name
  const [setupDone,setSetupDone]   = useState(false);
  const [appLoading,setAppLoading] = useState(true); // true while checking Supabase on launch
  const [syncing,setSyncing]       = useState(false);
  const [syncStatus,setSyncStatus] = useState(null);
  const [pushEnabled,setPushEnabled] = useState(false);
  const [pushError,setPushError]     = useState("");
  const [patchNum,setPatchNum]     = useState(1);
  const [patchApplied,setPatchApplied] = useState(new Date());
  const [tostranStart,setTostranStart] = useState(null);
  const [lastPeriodDate,setLastPeriodDate] = useState(null);
  const [cycleLength,setCycleLength] = useState(28);
  const [periodLogs,setPeriodLogs] = useState([]);
  const [completed,setCompleted]   = useState({});
  const [tab,setTab]               = useState("today");
  const [viewDate,setViewDate]     = useState(new Date());
  const [showSettings,setShowSettings] = useState(false);
  // settings edit state
  const [ePatch,setEPatch]         = useState(1);
  const [eApplied,setEApplied]     = useState(fmtDate(new Date()));
  const [eTostran,setETostran]     = useState(fmtDate(new Date()));
  const [eTrackTos,setETrackTos]   = useState(true);
  const [eLastPeriod,setELastPeriod] = useState(fmtDate(new Date()));
  const [eCycleLen,setECycleLen]   = useState("28");
  const [eTrackPeriod,setETrackPeriod] = useState(false);
  const saveTimer = useRef(null);
  const pendingCloudData = useRef(null); // stores cloud data for wizard pre-fill

  // On launch: always fetch latest data from Supabase
  // This ensures refresh never reverts to stale local state
  useEffect(()=>{
    async function loadLatest() {
      const cached = localStorage.getItem("hrt_userId");
      if(!cached) { setAppLoading(false); return; }
      try {
        const cloudData = await sbGet(cached);
        if(cloudData && cloudData.patchNum) {
          pendingCloudData.current = cloudData;
          setUserId(cached);
          applyCloudData(cloudData);  // always overwrite local state with cloud
          setSetupDone(true);
        } else {
          // No valid cloud data — show login
          localStorage.removeItem("hrt_userId");
          setUserId(null);
        }
      } catch(e) {
        console.warn("Failed to fetch latest from Supabase:", e);
        // Network error — keep cached userId, show login so user can retry
        setUserId(null);
      }
      setAppLoading(false);
    }
    loadLatest();
  },[]);

  useEffect(()=>{
    if("serviceWorker" in navigator&&"PushManager" in window)
      navigator.serviceWorker.ready.then(r=>r.pushManager.getSubscription().then(s=>setPushEnabled(!!s)));
  },[]);

  function applyCloudData(cloudData) {
    setPatchNum(cloudData.patchNum||1);
    setPatchApplied(new Date((cloudData.patchAppliedDate||fmtDate(new Date()))+"T12:00:00"));
    setTostranStart(cloudData.tostranStartDate?new Date(cloudData.tostranStartDate+"T12:00:00"):null);
    setLastPeriodDate(cloudData.lastPeriodDate||null);
    setCycleLength(cloudData.cycleLength||28);
    setPeriodLogs(cloudData.periodLogs||[]);
    setCompleted(cloudData.completedDoses||{});
  }

  async function handleLogin(uid, cloudData) {
    localStorage.setItem("hrt_userId", uid);
    setUserId(uid);
    pendingCloudData.current = cloudData || null;
    if(cloudData && cloudData.patchNum) {
      // Valid existing profile — load it and skip wizard entirely
      applyCloudData(cloudData);
      setSetupDone(true);
    }
    // Otherwise setupDone stays false → wizard shows for new users only
  }

  function payload(pn,pa,ts,lp,cl,pl,cd) {
    return {patchNum:pn,patchAppliedDate:fmtDate(pa),tostranStartDate:ts?fmtDate(ts):null,
      lastPeriodDate:lp||null,cycleLength:cl,periodLogs:pl||[],completedDoses:cd};
  }

  function scheduleSave(pn,pa,ts,lp,cl,pl,cd) {
    clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      if(!userId)return;
      setSyncing(true);
      try{await sbUpsert(userId,payload(pn,pa,ts,lp,cl,pl,cd));setSyncStatus("saved");setTimeout(()=>setSyncStatus(null),2000);}
      catch{setSyncStatus("error");}
      setSyncing(false);
    },1200);
  }

  async function handleSetupComplete({patchNum:pn,appliedDate:pa,tostranDate:ts,lastPeriodDate:lp,cycleLength:cl,periodLogs:pl}) {
    setPatchNum(pn);setPatchApplied(pa);setTostranStart(ts);setLastPeriodDate(lp);setCycleLength(cl||28);setPeriodLogs(pl||[]);
    setSetupDone(true);
    setSyncing(true);
    try{await sbUpsert(userId,payload(pn,pa,ts,lp,cl||28,pl||[],{}));setSyncStatus("saved");setTimeout(()=>setSyncStatus(null),2000);}
    catch{setSyncStatus("error");}
    setSyncing(false);
  }

  function toggleDone(id) {
    const next={...completed,[id]:!completed[id]};
    setCompleted(next);
    scheduleSave(patchNum,patchApplied,tostranStart,lastPeriodDate,cycleLength,periodLogs,next);
  }

  function handleLogPeriod(dateStr) {
    // Add to logs, deduplicate, sort
    const next=[...new Set([...periodLogs,dateStr])].sort();
    setPeriodLogs(next);
    // Update lastPeriodDate to most recent log
    const mostRecent=next[next.length-1];
    setLastPeriodDate(mostRecent);
    scheduleSave(patchNum,patchApplied,tostranStart,mostRecent,cycleLength,next,completed);
  }

  async function saveSettings() {
    // Build all values locally first - don't rely on state which may not have updated yet
    const pn = ePatch;
    const pa = new Date(eApplied+"T12:00:00");
    const ts = eTrackTos ? new Date(eTostran+"T12:00:00") : null;
    const lp = eTrackPeriod ? eLastPeriod : lastPeriodDate;
    const cl = eTrackPeriod ? parseInt(eCycleLen)||28 : cycleLength;
    const pl = periodLogs;
    const cd = completed;
    const uid = userId;

    // Update all state
    setPatchNum(pn);
    setPatchApplied(pa);
    setTostranStart(ts);
    if(eTrackPeriod){ setLastPeriodDate(lp); setCycleLength(cl); }

    // Save to Supabase THEN close panel
    setSyncing(true);
    try {
      await sbUpsert(uid, payload(pn, pa, ts, lp, cl, pl, cd));
      setSyncStatus("saved");
      setTimeout(()=>setSyncStatus(null), 2000);
    } catch(e) {
      console.error("Save failed:", e);
      setSyncStatus("error:" + e.message);
      setTimeout(()=>setSyncStatus(null), 5000);
    }
    setSyncing(false);
    setShowSettings(false);
  }

  async function handleEnablePush() {
    setPushError("");
    // Check service worker support
    if(!("serviceWorker" in navigator)) {
      setPushError("Service worker not supported in this browser");
      return;
    }
    if(!("PushManager" in window)) {
      setPushError("Push notifications not supported — make sure app is installed to home screen");
      return;
    }
    // Request permission
    let permission;
    try {
      permission = await Notification.requestPermission();
    } catch(e) {
      setPushError("Permission request failed: "+e.message);
      return;
    }
    if(permission !== "granted") {
      setPushError("Permission denied — go to iPhone Settings → Notifications → find this app → allow notifications");
      return;
    }
    // Subscribe
    const ok = await subscribeToPush(userId);
    if(ok) {
      setPushEnabled(true);
      setPushError("");
    } else {
      setPushError("Subscription failed — try closing and reopening the app from your home screen");
    }
  }

  function logout(){localStorage.removeItem("hrt_userId");setUserId(null);setSetupDone(false);setAppLoading(false);}

  function gcUrl(ev) {
    const d=ev.date,dt=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    const n=addDays(d,1),dt2=`${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}${String(n.getDate()).padStart(2,"0")}`;
    return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(ev.emoji+" "+ev.label)}&dates=${dt}/${dt2}`;
  }

  function exportICS() {
    const ics=generateICS(patchEvents,tostranEvents,periodEvents);
    const blob=new Blob([ics],{type:"text/calendar"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="hrt-schedule.ics";a.click();
    URL.revokeObjectURL(url);
  }

  // Loading splash while auto-login checks Supabase
  if(appLoading) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#FDF6F0,#F5EDE8,#EDE8F5)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <div style={{fontSize:52,marginBottom:16}}>🌸</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#3D2B1F",fontWeight:700,marginBottom:8}}>HRT Tracker</div>
      <div style={{fontSize:13,color:"#A08070"}}>Loading your profile…</div>
    </div>
  );

  // Not logged in — show login screen
  if(!userId) return <LoginScreen onLogin={handleLogin}/>;

  // Logged in but no Supabase data yet — first time setup
  if(!setupDone) return <SetupWizard onComplete={handleSetupComplete} existingData={pendingCloudData.current}/>;

  const cycleStart   = calcCycleStart(patchNum,patchApplied);
  const patchEvents  = generatePatchSchedule(cycleStart,6);
  const tostranEvents= tostranStart?generateTostranSchedule(tostranStart,180):[];
  const periodEvents = lastPeriodDate?generatePeriodSchedule(lastPeriodDate,cycleLength,periodLogs):[];
  const today        = new Date();
  const todayPatch   = patchEvents.find(e=>isSameDay(e.date,today));
  const todayTostran = tostranEvents.find(e=>isSameDay(e.date,today));
  const todayPeriod  = periodEvents.find(e=>isSameDay(e.date,today));
  const {patch:activePatch,cycleDay,slot} = getActivePatch(cycleStart);
  const upcoming = [...patchEvents,...tostranEvents,...periodEvents].filter(e=>e.date>today&&!isSameDay(e.date,today)).sort((a,b)=>a.date-b.date).slice(0,8);

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#FDF6F0,#F5EDE8,#EDE8F5)",fontFamily:"'DM Sans',sans-serif",paddingBottom:40}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#C4856A22,#A5B8A522)",borderBottom:"1px solid #E8DDD5",padding:"18px 20px 14px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:520,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,color:"#3D2B1F",fontWeight:700}}>HRT Tracker</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:1}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:syncing?"#E8C86A":syncStatus==="saved"?"#7BA57B":syncStatus==="error"?"#C4856A":"#C0C0C0"}}/>
              <div style={{fontSize:11,color:"#A08070"}}>{syncing?"Syncing…":syncStatus==="saved"?"Saved ✓":syncStatus?.startsWith("error")?"Sync failed — check connection":userId}</div>
            </div>
          </div>
          <button onClick={()=>{setEPatch(patchNum);setEApplied(fmtDate(patchApplied));setETrackTos(!!tostranStart);setETostran(tostranStart?fmtDate(tostranStart):fmtDate(new Date()));setETrackPeriod(!!lastPeriodDate);setELastPeriod(lastPeriodDate||fmtDate(new Date()));setECycleLen(String(cycleLength));setShowSettings(!showSettings);}} style={{background:showSettings?"#C4856A":"white",border:"1px solid #E0D0C4",borderRadius:10,padding:"7px 13px",cursor:"pointer",fontSize:13,color:showSettings?"white":"#7A6558",fontWeight:500}}>⚙ Settings</button>
        </div>
      </div>

      <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px"}}>

        {/* Settings panel */}
        {showSettings&&<div style={{background:"white",borderRadius:18,padding:20,marginTop:16,border:"1px solid #EDE5DC",boxShadow:"0 4px 20px #C4856A11"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"#3D2B1F",fontWeight:600,marginBottom:16}}>Settings</div>

          <label style={lbl}>Current patch</label>
          <div style={{fontSize:12,color:"#A08070",marginBottom:10,lineHeight:1.5}}>
            Update this if your patch has changed since you last opened the app. This recalculates your full schedule.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12}}>
            {PATCHES.map(p=>{const s=ePatch===p.num;return<button key={p.num} onClick={()=>setEPatch(p.num)} style={{border:`2px solid ${s?p.color:"#E0D5CC"}`,borderRadius:12,padding:"10px 3px 8px",cursor:"pointer",background:s?p.color+"20":"#FDFAF7",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:3,boxShadow:s?`0 3px 10px ${p.color}44`:"none"}}><span style={{fontSize:18}}>{p.emoji}</span><span style={{fontSize:13,fontWeight:700,color:s?(p.num<=4?"#B07070":"#5A8A6A"):"#3D2B1F"}}>#{p.num}</span><span style={{fontSize:9,color:"#A08070",textAlign:"center"}}>{p.num<=4?"Evorel 50":"Conti"}</span></button>;})}
          </div>

          <label style={lbl}>Date patch was applied</label>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            {["Today","Yesterday"].map(label=>{const val=fmtDate(label==="Today"?new Date():addDays(new Date(),-1));return<button key={label} onClick={()=>setEApplied(val)} style={{flex:1,padding:"8px",borderRadius:8,border:`1.5px solid ${eApplied===val?"#C4856A":"#E0D5CC"}`,background:eApplied===val?"#FFF0E8":"white",fontSize:12,fontWeight:600,color:eApplied===val?"#C4856A":"#7A6558",cursor:"pointer"}}>{label}</button>;})}
          </div>
          <input type="date" value={eApplied} onChange={e=>setEApplied(e.target.value)} style={inp} max={fmtDate(new Date())}/>

          <label style={{...lbl,marginTop:14}}>Track Tostran?</label>
          <div style={{display:"flex",gap:8,marginBottom:eTrackTos?10:16}}>
            {[["Yes",true],["No",false]].map(([l,v])=><button key={l} onClick={()=>setETrackTos(v)} style={{flex:1,padding:"8px",borderRadius:8,border:`1.5px solid ${eTrackTos===v?"#C4B5D4":"#E0D5CC"}`,background:eTrackTos===v?"#F5F0FF":"white",fontSize:12,fontWeight:600,color:eTrackTos===v?"#7A5A9A":"#7A6558",cursor:"pointer"}}>{l}</button>)}
          </div>
          {eTrackTos&&<div style={{marginBottom:14}}><label style={lbl}>Last Tostran application</label><input type="date" value={eTostran} onChange={e=>setETostran(e.target.value)} style={inp} max={fmtDate(new Date())}/></div>}

          {/* Period settings */}
          <div style={{paddingTop:14,borderTop:"1px solid #F0E8E0"}}>
            <label style={lbl}>🔴 Period tracking</label>
            <div style={{display:"flex",gap:8,marginBottom:eTrackPeriod?12:16}}>
              {[["Track",true],["Off",false]].map(([l,v])=><button key={l} onClick={()=>setETrackPeriod(v)} style={{flex:1,padding:"8px",borderRadius:8,border:`1.5px solid ${eTrackPeriod===v?"#E88080":"#E0D5CC"}`,background:eTrackPeriod===v?"#FFF0F0":"white",fontSize:12,fontWeight:600,color:eTrackPeriod===v?"#C06060":"#7A6558",cursor:"pointer"}}>{l}</button>)}
            </div>
            {eTrackPeriod&&<div>
              <label style={lbl}>First day of last period</label>
              <input type="date" value={eLastPeriod} onChange={e=>setELastPeriod(e.target.value)} style={inp} max={fmtDate(new Date())}/>
              <label style={{...lbl,marginTop:10}}>Cycle length (days)</label>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                {["21","24","28","30","35"].map(d=><button key={d} onClick={()=>setECycleLen(d)} style={{flex:1,padding:"8px",borderRadius:8,border:`1.5px solid ${eCycleLen===d?"#E88080":"#E0D5CC"}`,background:eCycleLen===d?"#FFF0F0":"white",fontSize:12,fontWeight:600,color:eCycleLen===d?"#C06060":"#7A6558",cursor:"pointer"}}>{d}</button>)}
              </div>
              <input type="number" value={eCycleLen} onChange={e=>setECycleLen(e.target.value)} min="15" max="60" style={inp}/>
              {periodLogs.length>0&&<div style={{marginTop:10}}>
                <div style={{fontSize:12,fontWeight:600,color:"#8A7265",marginBottom:6}}>Logged periods ({periodLogs.length})</div>
                <div style={{maxHeight:100,overflowY:"auto"}}>
                  {[...periodLogs].sort((a,b)=>new Date(b)-new Date(a)).map(d=>(
                    <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,color:"#7A6558",padding:"4px 0",borderBottom:"1px solid #F5EDE8"}}>
                      <span>🔴 {new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>
                      <button onClick={()=>{const next=periodLogs.filter(x=>x!==d);setPeriodLogs(next);scheduleSave(patchNum,patchApplied,tostranStart,next.length?next[next.length-1]:null,cycleLength,next,completed);}} style={{background:"none",border:"none",color:"#C06060",cursor:"pointer",fontSize:12}}>✕</button>
                    </div>
                  ))}
                </div>
              </div>}
            </div>}
          </div>

          {/* Push */}
          <div style={{paddingTop:14,borderTop:"1px solid #F0E8E0",marginTop:14}}>
            <label style={lbl}>🔔 Push notifications</label>
            {!pushEnabled ? (
              <div>
                <div style={{fontSize:12,color:"#8A7265",marginBottom:8,lineHeight:1.5}}>
                  Get notified every 2 hours on treatment days until you mark as done. Must be using the home screen icon, not Safari browser.
                </div>
                <button onClick={handleEnablePush} style={btn("#C4856A")}>Enable push notifications</button>
                {pushError&&<div style={{fontSize:12,color:"#C4856A",marginTop:8,lineHeight:1.5}}>⚠ {pushError}</div>}
              </div>
            ) : (
              <div>
                <div style={{fontSize:12,color:"#7BA57B",marginBottom:6}}>✓ Active — notifies every 2 hours on treatment days until marked done</div>
                <button onClick={async()=>{await unsubscribeFromPush();setPushEnabled(false);}} style={{...btn("#A09080"),background:"white",color:"#A09080",border:"1px solid #E0D5CC"}}>Disable notifications</button>
              </div>
            )}
          </div>

          <div style={{paddingTop:14,borderTop:"1px solid #F0E8E0",marginTop:14}}>
            <button onClick={exportICS} style={btn("#7BA57B")}>↓ Download .ics (6 months)</button>
          </div>

          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={logout} style={{flex:1,padding:"10px",borderRadius:12,border:"1px solid #E0D0C8",background:"white",fontSize:12,color:"#B07060",cursor:"pointer"}}>Log out</button>
            <button onClick={saveSettings} style={{flex:2,padding:"10px",borderRadius:12,border:"none",background:"#C4856A",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>Save & sync</button>
          </div>
        </div>}

        {/* Hero */}
        <div style={{background:`linear-gradient(135deg,${activePatch.color}30,${activePatch.color}10)`,border:`1.5px solid ${activePatch.color}66`,borderRadius:20,padding:"18px 20px",marginTop:16,boxShadow:`0 8px 28px ${activePatch.color}20`}}>
          <div style={{fontSize:10,fontWeight:600,color:activePatch.color,letterSpacing:1.2,textTransform:"uppercase",marginBottom:8}}>Currently wearing</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:40}}>{activePatch.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,color:"#3D2B1F",fontWeight:700,lineHeight:1.1}}>{activePatch.patch}</div>
              <div style={{fontSize:12,color:"#7A6558",marginTop:3}}>{activePatch.type} · Week {activePatch.week} of 4</div>
              <div style={{fontSize:11,color:"#A08070",marginTop:2}}>Patch #{slot+1} of 8 · cycle day {cycleDay+1} of 28</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:8,height:80,background:"#F0E8E0",borderRadius:4,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",bottom:0,left:0,right:0,background:activePatch.color,height:`${((cycleDay+1)/28)*100}%`,borderRadius:4}}/></div>
              <div style={{fontSize:9,color:"#A08070",textAlign:"center"}}>cycle<br/>progress</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginTop:18,background:"#F0E8E0",borderRadius:14,padding:4}}>
          {[["today","Today"],["upcoming","Upcoming"],["calendar","Calendar"],["cycle","Cycle"]].map(([t,label])=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,background:tab===t?"white":"none",border:"none",borderRadius:10,padding:"9px 2px",cursor:"pointer",fontSize:12,fontWeight:tab===t?600:400,color:tab===t?"#3D2B1F":"#9A8A7A",transition:"all 0.2s",boxShadow:tab===t?"0 2px 8px #00000012":"none"}}>{label}</button>
          ))}
        </div>

        {/* TODAY */}
        {tab==="today"&&<div style={{marginTop:16}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#9A8A7A",marginBottom:10}}>{today.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>
          {!todayPatch&&!todayTostran&&!todayPeriod&&<div style={{background:"white",borderRadius:16,padding:"26px 20px",textAlign:"center",border:"1px solid #EDE5DC",marginBottom:10}}><div style={{fontSize:34,marginBottom:8}}>✨</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:"#3D2B1F",fontWeight:600}}>Nothing to do today</div><div style={{fontSize:13,color:"#A08070",marginTop:5}}>Rest day</div></div>}
          {todayPatch&&<DoseCard ev={todayPatch} done={completed[todayPatch.id]} onToggle={()=>toggleDone(todayPatch.id)} gcUrl={gcUrl(todayPatch)}/>}
          {todayTostran&&<DoseCard ev={todayTostran} done={completed[todayTostran.id]} onToggle={()=>toggleDone(todayTostran.id)} gcUrl={gcUrl(todayTostran)}/>}
          {todayPeriod&&<div style={{background:"#FFF5F5",border:"1px solid #F0C0C0",borderRadius:16,padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24}}>🔴</span><div><div style={{fontSize:14,fontWeight:600,color:"#3D2B1F"}}>{todayPeriod.label}</div><div style={{fontSize:12,color:"#A08070"}}>{todayPeriod.isPredicted?"Predicted based on your cycle":"Logged period"}</div></div></div>
            {todayPeriod.isPredicted&&<button onClick={()=>handleLogPeriod(fmtDate(today))} style={{marginTop:10,width:"100%",padding:"9px",borderRadius:10,border:"none",background:"#E88080",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>✓ Confirm period started today</button>}
          </div>}
          {lastPeriodDate&&<LogPeriodCard onLog={handleLogPeriod}/>}
          <div style={{background:"#F7F3FF",borderRadius:14,padding:"13px 15px",marginTop:4,border:"1px solid #E0D8F0"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#7A6598",marginBottom:6}}>💡 Tips</div>
            <div style={{fontSize:12,color:"#7A6598",lineHeight:1.65}}>Patches: clean, dry skin on buttocks or abdomen. Rotate sites. Press 10 seconds. Tostran: inner thigh or abdomen, wash hands after.</div>
          </div>
        </div>}

        {/* UPCOMING */}
        {tab==="upcoming"&&<div style={{marginTop:16}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#9A8A7A",marginBottom:10}}>Coming up</div>
          {upcoming.map(ev=>(
            <div key={ev.id} style={{background:"white",borderRadius:14,padding:"13px 15px",marginBottom:8,border:"1px solid #EDE5DC",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:11,background:ev.color+(ev.isPredicted?"44":"33"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ev.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:"#3D2B1F"}}>{ev.label}{ev.patchNum&&<span style={{fontSize:11,color:"#A08070",fontWeight:400}}> (#{ev.patchNum}/8)</span>}</div>
                <div style={{fontSize:12,color:"#A08070",marginTop:2}}>{ev.date.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}{ev.isPredicted&&" · predicted"}</div>
              </div>
              {ev.type!=="period"&&<button onClick={()=>window.open(gcUrl(ev),"_blank")} style={{background:"none",border:"1px solid #E0D5CC",borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:12,color:"#7A6558"}}>📅</button>}
            </div>
          ))}
        </div>}

        {/* CALENDAR */}
        {tab==="calendar"&&<div style={{marginTop:16,background:"white",borderRadius:18,padding:18,border:"1px solid #EDE5DC"}}>
          <CalendarView patchEvents={patchEvents} tostranEvents={tostranEvents} periodEvents={periodEvents} viewDate={viewDate} setViewDate={setViewDate} onLogPeriod={handleLogPeriod}/>
          <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid #F0E8E0"}}><button onClick={exportICS} style={btn("#7BA57B")}>↓ Download .ics → import to Google / Apple Calendar</button></div>
        </div>}

        {/* CYCLE */}
        {tab==="cycle"&&<div style={{marginTop:16}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#9A8A7A",marginBottom:12}}>8-patch Evorel Sequi cycle</div>
          <div style={{background:"white",borderRadius:16,padding:16,border:"1px solid #EDE5DC",marginBottom:10}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:4,marginBottom:10}}>
              {PATCHES.map(p=>{const c=p.num===slot+1;return<div key={p.num} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{width:"100%",height:6,borderRadius:3,background:p.color,opacity:c?1:0.4}}/><div style={{width:28,height:28,borderRadius:8,background:c?p.color+"30":"#F5F0EA",border:`${c?2:1}px solid ${c?p.color:"#E0D5CC"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:c?14:11,position:"relative"}}>{c?p.emoji:<span style={{fontWeight:700,color:"#9A8070"}}>{p.num}</span>}{c&&<div style={{position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:"#C4856A"}}/>}</div><div style={{fontSize:8,color:c?(p.num<=4?"#B07070":"#5A8A6A"):"#B0A090",textAlign:"center",fontWeight:c?700:400}}>#{p.num}</div></div>;})}
            </div>
            <div style={{fontSize:13,color:"#7A6558",lineHeight:1.75}}><div>📅 Changed twice per week, 3–4 days apart</div><div>🔁 8 patches per 28-day cycle</div><div>🌸 Patches 1–4: Evorel 50 (oestrogen only)</div><div>🌿 Patches 5–8: Evorel Conti (oestrogen + progesterone)</div></div>
          </div>
          {lastPeriodDate&&<div style={{background:"#FFF5F5",borderRadius:16,padding:"15px 17px",border:"1px solid #F0C0C0",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:600,color:"#C06060",marginBottom:8}}>🔴 Period tracking</div>
            <div style={{fontSize:13,color:"#8A5858",lineHeight:1.75}}>
              <div>📅 Cycle length: <strong>{cycleLength} days</strong></div>
              <div>📆 Last period: <strong>{new Date(lastPeriodDate+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</strong></div>
              <div>📊 Logged periods: <strong>{periodLogs.length}</strong></div>
            </div>
          </div>}
          {tostranStart&&<div style={{background:"#F7F0FF",borderRadius:16,padding:"15px 17px",border:"1px solid #E0D5F0"}}><div style={{fontSize:13,fontWeight:600,color:"#6B5A8A",marginBottom:8}}>💜 Tostran</div><div style={{fontSize:13,color:"#7A6598",lineHeight:1.75}}><div>⏱ Every other day</div><div>📍 Inner thigh or lower abdomen</div><div>🖐 Wash hands after · cover until dry</div></div></div>}
        </div>}
      </div>
    </div>
  );
}

const lbl    = {display:"block",fontSize:12,fontWeight:600,color:"#8A7265",marginBottom:6,letterSpacing:0.3};
const inp    = {width:"100%",padding:"9px 12px",border:"1px solid #E0D5CC",borderRadius:10,fontSize:14,color:"#3D2B1F",background:"#FDFAF7",boxSizing:"border-box",outline:"none"};
const navBtn = {background:"none",border:"1px solid #E0D5CC",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:18,color:"#8A7265",display:"flex",alignItems:"center",justifyContent:"center"};
function btn(color){return{display:"block",width:"100%",background:color,color:"white",border:"none",borderRadius:10,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:600,margin:"4px 0 0",textAlign:"center"};}
