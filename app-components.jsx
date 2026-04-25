// ─── app-components.jsx — shared UI components ────────────────
const { useState, useEffect, useRef, useCallback, useMemo, useContext, createContext } = React;

// ─── Theme context ────────────────────────────────────────────
const ThemeCtx = createContext(DARK);
const useT = () => useContext(ThemeCtx);

// ─── Ring ─────────────────────────────────────────────────────
function Ring({ pct, size=110, stroke=10, color='#6366f1' }) {
  const T = useT();
  const r=(size-stroke)/2, c=2*Math.PI*r, off=c-(pct/100)*c;
  return (
    <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.ringBg} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
        style={{transition:'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)'}}/>
    </svg>
  );
}

// ─── Toast ────────────────────────────────────────────────────
const TOAST_MSGS = ['¡Excelente! 💪','¡Así se hace! ⚡','¡Un paso más! 🚀','¡Imparable! 🔥','¡Tú puedes! ✨','¡Sigue adelante! 🎯','¡Bien hecho! 👏'];

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, color='#6366f1', icon='✦') => {
    const id = crypto.randomUUID();
    setToasts(p=>[...p,{id,msg,color,icon,dying:false}]);
    setTimeout(()=>{
      setToasts(p=>p.map(t=>t.id===id?{...t,dying:true}:t));
      setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),380);
    },2800);
  },[]);
  return { toasts, add };
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{position:'absolute',top:90,right:12,zIndex:200,display:'flex',flexDirection:'column',gap:8,pointerEvents:'none'}}>
      {toasts.map(t=>(
        <div key={t.id} style={{
          display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:14,
          background:`linear-gradient(135deg,${t.color}ee,${t.color}bb)`,
          boxShadow:`0 4px 20px ${t.color}55`,maxWidth:190,
          animation:t.dying?'toastOut .35s ease forwards':'toastIn .3s cubic-bezier(.34,1.56,.64,1) both',
        }}>
          <span style={{fontSize:16}}>{t.icon}</span>
          <span style={{color:'#fff',fontSize:13,fontWeight:700,lineHeight:1.2}}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Confetti burst ───────────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  const pieces = useMemo(()=>Array.from({length:60},(_,i)=>{
    const angle=(i/60)*360+(Math.random()-.5)*20, dist=40+Math.random()*180;
    const rad=angle*Math.PI/180;
    return { id:i, x:50+(Math.random()-.5)*30, y:45+(Math.random()-.5)*20,
      tx:Math.cos(rad)*dist, ty:Math.sin(rad)*dist,
      delay:Math.random()*.3, dur:1.2+Math.random()*1.4,
      color:PALETTE[Math.floor(Math.random()*PALETTE.length)],
      size:5+Math.random()*7, shape:Math.random()>.4?'50%':Math.random()>.5?'2px':'0%',
      spin:(Math.random()-.5)*720 };
  }),[]);
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:99}}>
      {pieces.map(p=>(
        <div key={p.id} style={{position:'absolute',left:`${p.x}%`,top:`${p.y}%`,
          width:p.size,height:p.size,background:p.color,borderRadius:p.shape,
          animation:`burst ${p.dur}s cubic-bezier(.22,.61,.36,1) ${p.delay}s forwards`,
          '--tx':`${p.tx}px`,'--ty':`${p.ty}px`,'--spin':`${p.spin}deg`}}/>
      ))}
      <div style={{position:'absolute',left:'50%',top:'45%',transform:'translate(-50%,-50%)',
        width:60,height:60,borderRadius:'50%',
        background:'radial-gradient(circle,rgba(255,255,255,0.9),transparent)',
        animation:'flashOut 0.6s ease forwards',pointerEvents:'none'}}/>
    </div>
  );
}

// ─── Ambient BG ───────────────────────────────────────────────
function AmbientBg({ maxStreak, lightMode }) {
  const level = maxStreak>=7?3:maxStreak>=3?2:1;
  const sets = {
    1: lightMode
      ? [{w:500,h:500,t:'-120px',l:'-160px',c:'rgba(99,102,241,0.18)',an:'drift1 13s ease-in-out infinite alternate'},
         {w:420,h:420,b:'-80px',r:'-100px',c:'rgba(168,85,247,0.14)',an:'drift2 16s ease-in-out infinite alternate'},
         {w:300,h:300,t:'40%',l:'40%',c:'rgba(236,72,153,0.08)',an:'drift1 20s ease-in-out infinite alternate-reverse'}]
      : [{w:500,h:500,t:'-120px',l:'-160px',c:'rgba(99,102,241,0.4)',an:'drift1 13s ease-in-out infinite alternate'},
         {w:420,h:420,b:'-80px',r:'-100px',c:'rgba(168,85,247,0.3)',an:'drift2 16s ease-in-out infinite alternate'},
         {w:300,h:300,t:'40%',l:'40%',c:'rgba(236,72,153,0.12)',an:'drift1 20s ease-in-out infinite alternate-reverse'}],
    2: lightMode
      ? [{w:520,h:520,t:'-120px',l:'-160px',c:'rgba(234,179,8,0.2)',an:'drift1 11s ease-in-out infinite alternate'},
         {w:440,h:440,b:'-80px',r:'-100px',c:'rgba(249,115,22,0.15)',an:'drift2 14s ease-in-out infinite alternate'},
         {w:320,h:320,t:'38%',l:'35%',c:'rgba(251,146,60,0.1)',an:'drift1 18s ease-in-out infinite alternate-reverse'}]
      : [{w:520,h:520,t:'-120px',l:'-160px',c:'rgba(234,179,8,0.35)',an:'drift1 11s ease-in-out infinite alternate'},
         {w:440,h:440,b:'-80px',r:'-100px',c:'rgba(249,115,22,0.3)',an:'drift2 14s ease-in-out infinite alternate'},
         {w:320,h:320,t:'38%',l:'35%',c:'rgba(251,146,60,0.18)',an:'drift1 18s ease-in-out infinite alternate-reverse'}],
    3: lightMode
      ? [{w:560,h:560,t:'-130px',l:'-170px',c:'rgba(251,113,33,0.22)',an:'drift1 9s ease-in-out infinite alternate'},
         {w:460,h:460,b:'-90px',r:'-110px',c:'rgba(239,68,68,0.16)',an:'drift2 12s ease-in-out infinite alternate'},
         {w:340,h:340,t:'35%',l:'32%',c:'rgba(234,179,8,0.12)',an:'drift1 16s ease-in-out infinite alternate-reverse'}]
      : [{w:560,h:560,t:'-130px',l:'-170px',c:'rgba(251,113,33,0.45)',an:'drift1 9s ease-in-out infinite alternate'},
         {w:460,h:460,b:'-90px',r:'-110px',c:'rgba(239,68,68,0.32)',an:'drift2 12s ease-in-out infinite alternate'},
         {w:340,h:340,t:'35%',l:'32%',c:'rgba(234,179,8,0.25)',an:'drift1 16s ease-in-out infinite alternate-reverse'}],
  };
  const blobs = sets[level];
  return (
    <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',transition:'background 1.5s ease'}}>
      {blobs.map((b,i)=>(
        <div key={`${level}-${i}`} style={{
          position:'absolute',borderRadius:'50%',filter:'blur(80px)',
          width:b.w,height:b.h,top:b.t,left:b.l,bottom:b.b,right:b.r,
          background:`radial-gradient(circle,${b.c},transparent 70%)`,
          animation:`${b.an},blobFadeIn 1.5s ease forwards`,
          animationDelay:`${i*0.2}s`,opacity:0,
        }}/>
      ))}
    </div>
  );
}

// ─── Counter ──────────────────────────────────────────────────
function Counter({ to, dur=900, suffix='' }) {
  const [val,setVal]=useState(0);
  useEffect(()=>{
    const s=Date.now(),tick=()=>{
      const p=Math.min((Date.now()-s)/dur,1),e=1-Math.pow(1-p,3);
      setVal(Math.round(e*to));
      if(p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },[to]);
  return <>{val}{suffix}</>;
}

// ─── Small icon helper ────────────────────────────────────────
function Ic({ d, size=20, stroke='currentColor', fill='none', sw=2, style:s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
         strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={s}>
      {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
    </svg>
  );
}

// ─── Context menu (long press) ────────────────────────────────
function ContextMenu({ habit, onEdit, onDelete, onClose }) {
  const T = useT();
  return (
    <div style={{position:'absolute',inset:0,zIndex:50,background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',
      display:'flex',alignItems:'center',justifyContent:'center'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.sheetBg,borderRadius:24,padding:8,width:220,
        border:`1px solid ${T.cardBorder}`,animation:'sheetUp .22s ease both',overflow:'hidden'}}>
        <div style={{padding:'14px 16px 12px',borderBottom:`1px solid ${T.cardBorder}`,marginBottom:4}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:22}}>{habit.icon}</span>
            <div>
              <p style={{color:T.text,fontSize:14,fontWeight:700}}>{habit.name}</p>
              <p style={{color:T.textDim,fontSize:12,marginTop:2}}>{CAT_IC[habit.category]} {habit.category}</p>
            </div>
          </div>
        </div>
        {[{label:'Editar hábito',icon:'✏️',action:onEdit,color:T.text},{label:'Eliminar',icon:'🗑',action:onDelete,color:'#f87171'}].map(item=>(
          <button key={item.label} onClick={item.action} style={{
            width:'100%',display:'flex',alignItems:'center',gap:12,padding:'13px 16px',
            background:'transparent',border:'none',cursor:'pointer',borderRadius:14,
            fontFamily:'Inter,sans-serif',transition:'background .15s',
          }}
          onMouseEnter={e=>e.currentTarget.style.background=T.chipInactive}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <span style={{fontSize:18}}>{item.icon}</span>
            <span style={{color:item.color,fontSize:14,fontWeight:500}}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Delete sheet ─────────────────────────────────────────────
function DeleteSheet({ habit, onClose, onConfirm }) {
  const T = useT();
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet" style={{background:T.sheetBg,textAlign:'center'}}>
        <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
        <div style={{fontSize:44,marginBottom:10}}>{habit.icon}</div>
        <p style={{color:T.text,fontSize:17,fontWeight:700,marginBottom:5}}>¿Eliminar hábito?</p>
        <p style={{color:T.textDim,fontSize:14,marginBottom:26}}>"{habit.name}" y su racha desaparecerán.</p>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer'}}>Cancelar</button>
          <button onClick={onConfirm} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ef4444,#f97316)',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:600,cursor:'pointer'}}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Timer Sheet (full-screen timer) ─────────────────────────
function TimerSheet({ habit, onClose, onDone }) {
  const T = useT();
  const [elapsed, setElapsed] = useState(habit.timeSpent||0);
  const [running, setRunning] = useState(false);
  const intv = useRef(null);
  const target = habit.target||300;
  const pct = Math.min(Math.round(elapsed/target*100),100);

  useEffect(()=>{
    if(running) { intv.current=setInterval(()=>setElapsed(e=>e+1),1000); }
    else clearInterval(intv.current);
    return ()=>clearInterval(intv.current);
  },[running]);

  useEffect(()=>{ if(elapsed>=target&&running){ setRunning(false); playSuccessChime(); } },[elapsed]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="overlay">
      <div className="sheet" style={{background:T.sheetBg,textAlign:'center',paddingBottom:44}}>
        <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
        <div style={{fontSize:44,marginBottom:8}}>{habit.icon}</div>
        <p style={{color:T.text,fontSize:17,fontWeight:700,marginBottom:4}}>{habit.name}</p>
        <p style={{color:T.textDim,fontSize:13,marginBottom:28}}>Meta: {fmt(target)}</p>

        {/* Ring */}
        <div style={{position:'relative',display:'inline-flex',marginBottom:28}}>
          <Ring pct={pct} size={160} stroke={14} color={habit.color}/>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:T.text,fontSize:32,fontWeight:800,fontVariantNumeric:'tabular-nums'}}>{fmt(elapsed)}</span>
            <span style={{color:T.textDim,fontSize:13,marginTop:4}}>{pct}%</span>
          </div>
        </div>

        <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:24}}>
          <button onClick={()=>setElapsed(0)} style={{width:52,height:52,borderRadius:'50%',border:`1px solid ${T.cardBorder}`,background:T.chipInactive,cursor:'pointer',fontSize:22}}>↺</button>
          <button onClick={()=>setRunning(r=>!r)} style={{width:72,height:72,borderRadius:'50%',border:'none',background:`linear-gradient(135deg,${habit.color},${habit.color}99)`,cursor:'pointer',fontSize:30,boxShadow:`0 6px 20px ${habit.color}55`}}>
            {running?'⏸':'▶'}
          </button>
          <button onClick={()=>{ onDone(elapsed); onClose(); }} style={{width:52,height:52,borderRadius:'50%',border:'none',background:elapsed>=target?'linear-gradient(135deg,#22c55e,#16a34a)':T.chipInactive,cursor:'pointer',fontSize:22}}>✓</button>
        </div>

        {elapsed>=target&&<p style={{color:'#22c55e',fontSize:14,fontWeight:700,marginBottom:12}}>¡Meta alcanzada! 🎉</p>}
        <button onClick={onClose} style={{background:T.chipInactive,color:T.textDim,border:`1px solid ${T.cardBorder}`,borderRadius:16,padding:'12px 28px',fontFamily:'Inter,sans-serif',fontSize:15,cursor:'pointer'}}>Cerrar</button>
      </div>
    </div>
  );
}

// ─── AI Sheet ─────────────────────────────────────────────────
function AISheet({ habits, onAdd, onClose }) {
  const T = useT();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());

  useEffect(()=>{
    const cats = [...new Set(habits.map(h=>h.category))];
    const names = habits.map(h=>h.name).join(', ');
    const prompt = `Eres un experto en hábitos saludables. El usuario ya tiene estos hábitos: ${names||'ninguno'}. Sus categorías: ${cats.join(', ')||'ninguna'}. Sugiere exactamente 5 hábitos nuevos y distintos en formato JSON array: [{"name":"...","icon":"(emoji)","color":"(hex de ${PALETTE.join('|')})","category":"(Salud|Mente|Fitness|Trabajo|Personal)","type":"boolean","target":1,"frequency":"daily"}]. Solo el JSON, sin texto extra.`;
    window.claude.complete(prompt)
      .then(txt=>{
        const match = txt.match(/\[[\s\S]*\]/);
        if (!match) throw new Error('no json');
        const arr = JSON.parse(match[0]);
        setSuggestions(arr.slice(0,5));
        setLoading(false);
      })
      .catch(()=>{
        setSuggestions(SUGGESTED.slice(0,5));
        setLoading(false);
      });
  },[]);

  const toggle = i => setSelected(p=>{ const s=new Set(p); s.has(i)?s.delete(i):s.add(i); return s; });

  const confirm = () => {
    [...selected].forEach(i=>onAdd({...suggestions[i],done:false,streak:0,lastDate:null,history:{},count:0,timeSpent:0}));
    onClose();
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet" style={{background:T.sheetBg}}>
        <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
        <p style={{color:T.text,fontSize:18,fontWeight:700,marginBottom:4}}>Sugerencias IA ✦</p>
        <p style={{color:T.textDim,fontSize:13,marginBottom:18}}>Personalizadas para ti</p>
        {loading?(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:'30px 0'}}>
            <div style={{fontSize:36,animation:'flicker .8s ease-in-out infinite'}}>🤖</div>
            <p style={{color:T.textDim,fontSize:14}}>Generando sugerencias…</p>
          </div>
        ):(
          <>
            <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:22}}>
              {suggestions.map((s,i)=>{
                const on=selected.has(i);
                return (
                  <div key={i} onClick={()=>toggle(i)} style={{
                    display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:16,cursor:'pointer',
                    background:on?s.color+'22':T.chipInactive,border:`1.5px solid ${on?s.color+'66':T.cardBorder}`,transition:'all .18s',
                  }}>
                    <span style={{fontSize:24}}>{s.icon}</span>
                    <div style={{flex:1}}>
                      <p style={{color:T.text,fontSize:14,fontWeight:600}}>{s.name}</p>
                      <p style={{color:T.textDim,fontSize:12,marginTop:2}}>{CAT_IC[s.category]} {s.category}</p>
                    </div>
                    <div style={{width:24,height:24,borderRadius:'50%',flexShrink:0,
                      background:on?s.color:'transparent',border:`2px solid ${on?s.color:T.textFaint}`,
                      display:'flex',alignItems:'center',justifyContent:'center',transition:'all .18s'}}>
                      {on&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={onClose} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer'}}>Cancelar</button>
              <button onClick={confirm} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:600,cursor:'pointer',opacity:selected.size?1:.5}}>
                Añadir {selected.size>0?`${selected.size} hábito${selected.size!==1?'s':''}`:''} ✦
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Add Sheet ────────────────────────────────────────────────
function AddSheet({ onClose, onAdd }) {
  const T = useT();
  const [name,setName]   = useState('');
  const [color,setColor] = useState(PALETTE[0]);
  const [icon,setIcon]   = useState(HABIT_ICS[0]);
  const [cat,setCat]     = useState('Personal');
  const [type,setType]   = useState('boolean');
  const [target,setTarget]= useState(8);
  const [freq,setFreq]       = useState('daily');
  const [schedTime,setSchedTime] = useState('');
  const ref = useRef(null);
  useEffect(()=>{ setTimeout(()=>ref.current?.focus(),350); },[]);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ name:name.trim(),color,icon,category:cat,type,target:Number(target),frequency:freq,scheduledTime:schedTime||null,done:false,streak:0,lastDate:null,history:{},count:0,timeSpent:0 });
    onClose();
  };

  const inp = { className:'inp', style:{background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,color:T.text,marginBottom:16} };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet" style={{background:T.sheetBg,maxHeight:'88%',overflowY:'auto'}}>
        <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <span style={{color:T.text,fontSize:18,fontWeight:700}}>Nuevo hábito</span>
          <button onClick={onClose} style={{background:T.chipInactive,border:'none',borderRadius:'50%',width:30,height:30,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:T.textDim}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <Label T={T}>Ícono</Label>
        <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:16}}>
          {HABIT_ICS.map(ic=>(
            <button key={ic} onClick={()=>setIcon(ic)} style={{width:38,height:38,borderRadius:12,border:`1.5px solid ${icon===ic?'#6366f1':T.cardBorder}`,background:icon===ic?'rgba(99,102,241,.22)':T.chipInactive,cursor:'pointer',fontSize:19,transition:'all .15s'}}>{ic}</button>
          ))}
        </div>

        <Label T={T}>Nombre</Label>
        <input ref={ref} {...inp} placeholder="Ej: Meditar 5 minutos…" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} style={{...inp.style,width:'100%',padding:'13px 15px',borderRadius:14,outline:'none',fontFamily:'Inter,sans-serif',fontSize:15}}/>

        <Label T={T}>Tipo de hábito</Label>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {[['boolean','✅','Completar'],['counter','🔢','Contador'],['timer','⏱','Temporizador']].map(([id,ic,lb])=>(
            <button key={id} onClick={()=>setType(id)} style={{flex:1,padding:'10px 4px',borderRadius:14,border:`1.5px solid ${type===id?'#6366f1':T.cardBorder}`,background:type===id?'rgba(99,102,241,.2)':T.chipInactive,cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:12,fontWeight:600,color:type===id?'#a5b4fc':T.textDim,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <span style={{fontSize:20}}>{ic}</span>{lb}
            </button>
          ))}
        </div>

        {(type==='counter'||type==='timer')&&(
          <>
            <Label T={T}>{type==='counter'?'Meta (unidades)':'Duración (minutos)'}</Label>
            <input type="number" min={1} value={type==='timer'?Math.round(target/60):target}
              onChange={e=>setTarget(type==='timer'?Number(e.target.value)*60:Number(e.target.value))}
              style={{...inp.style,width:'100%',padding:'13px 15px',borderRadius:14,outline:'none',fontFamily:'Inter,sans-serif',fontSize:15}}/>
          </>
        )}

        <Label T={T}>Categoría</Label>
        <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:16}}>
          {CATS.filter(c=>c!=='Todos').map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{padding:'6px 12px',borderRadius:99,border:`1px solid ${cat===c?'rgba(99,102,241,.4)':T.cardBorder}`,background:cat===c?'rgba(99,102,241,.25)':T.chipInactive,color:cat===c?'#a5b4fc':T.chipColor,fontFamily:'Inter,sans-serif',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s'}}>{CAT_IC[c]} {c}</button>
          ))}
        </div>

        <Label T={T}>Frecuencia</Label>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {FREQ_OPTS.map(f=>(
            <button key={f.id} onClick={()=>setFreq(f.id)} style={{flex:1,padding:'9px 4px',borderRadius:14,border:`1.5px solid ${freq===f.id?'#6366f1':T.cardBorder}`,background:freq===f.id?'rgba(99,102,241,.2)':T.chipInactive,cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:11,fontWeight:600,color:freq===f.id?'#a5b4fc':T.textDim,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
              <span style={{fontSize:16}}>{f.icon}</span>{f.label}
            </button>
          ))}
        </div>

        <Label T={T}>Hora en Mi Día (opcional)</Label>
        <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:16}}>
          <input type="time" value={schedTime} onChange={e=>setSchedTime(e.target.value)}
            style={{flex:1,padding:'11px 13px',borderRadius:12,border:`1.5px solid ${T.inputBorder}`,background:T.inputBg,color:T.text,fontFamily:'Inter,sans-serif',fontSize:14,outline:'none'}}/>
          {schedTime&&<button onClick={()=>setSchedTime('')} style={{padding:'10px 12px',borderRadius:12,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:13,cursor:'pointer'}}>✕</button>}
        </div>
        {schedTime&&<p style={{color:'rgba(99,102,241,.8)',fontSize:12,marginTop:-10,marginBottom:14}}>⏰ Anclado a las {schedTime} en Mi Día</p>}

        <Label T={T}>Color</Label>
        <div style={{display:'flex',gap:9,flexWrap:'wrap',marginBottom:22}}>
          {PALETTE.map(c=>(
            <div key={c} onClick={()=>setColor(c)} style={{width:32,height:32,borderRadius:'50%',background:c,cursor:'pointer',border:color===c?'3px solid #fff':'3px solid transparent',boxShadow:color===c?'0 0 0 2px rgba(255,255,255,.25)':'none',transition:'all .15s'}}/>
          ))}
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer'}}>Cancelar</button>
          <button onClick={submit} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:600,cursor:'pointer',opacity:name.trim()?1:.45}}>Añadir ✦</button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Sheet ───────────────────────────────────────────────
function EditSheet({ habit, onClose, onSave }) {
  const T = useT();
  const [name,setName]   = useState(habit.name);
  const [color,setColor] = useState(habit.color);
  const [icon,setIcon]   = useState(habit.icon);
  const [cat,setCat]     = useState(habit.category);
  const [freq,setFreq]         = useState(habit.frequency||'daily');
  const [schedTime,setSchedTime]= useState(habit.scheduledTime||'');

  const submit = () => {
    if (!name.trim()) return;
    onSave(habit.id,{name:name.trim(),color,icon,category:cat,frequency:freq,scheduledTime:schedTime||null});
    onClose();
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet" style={{background:T.sheetBg,maxHeight:'88%',overflowY:'auto'}}>
        <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
        <p style={{color:T.text,fontSize:18,fontWeight:700,marginBottom:18}}>Editar ✏️</p>

        <Label T={T}>Ícono</Label>
        <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:16}}>
          {HABIT_ICS.map(ic=>(<button key={ic} onClick={()=>setIcon(ic)} style={{width:38,height:38,borderRadius:12,border:`1.5px solid ${icon===ic?'#6366f1':T.cardBorder}`,background:icon===ic?'rgba(99,102,241,.22)':T.chipInactive,cursor:'pointer',fontSize:19}}>{ic}</button>))}
        </div>

        <Label T={T}>Nombre</Label>
        <input autoFocus className="inp" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}
          style={{width:'100%',padding:'13px 15px',borderRadius:14,outline:'none',fontFamily:'Inter,sans-serif',fontSize:15,background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,color:T.text,marginBottom:16}}/>

        <Label T={T}>Categoría</Label>
        <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:16}}>
          {CATS.filter(c=>c!=='Todos').map(c=>(<button key={c} onClick={()=>setCat(c)} style={{padding:'6px 12px',borderRadius:99,border:`1px solid ${cat===c?'rgba(99,102,241,.4)':T.cardBorder}`,background:cat===c?'rgba(99,102,241,.25)':T.chipInactive,color:cat===c?'#a5b4fc':T.chipColor,fontFamily:'Inter,sans-serif',fontSize:12,fontWeight:600,cursor:'pointer'}}>{CAT_IC[c]} {c}</button>))}
        </div>

        <Label T={T}>Frecuencia</Label>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {FREQ_OPTS.map(f=>(<button key={f.id} onClick={()=>setFreq(f.id)} style={{flex:1,padding:'9px 4px',borderRadius:14,border:`1.5px solid ${freq===f.id?'#6366f1':T.cardBorder}`,background:freq===f.id?'rgba(99,102,241,.2)':T.chipInactive,cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:11,fontWeight:600,color:freq===f.id?'#a5b4fc':T.textDim,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}><span style={{fontSize:16}}>{f.icon}</span>{f.label}</button>))}
        </div>

        <Label T={T}>Hora programada (Mi Día)</Label>
        <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:16}}>
          <input type="time" value={schedTime} onChange={e=>setSchedTime(e.target.value)}
            style={{flex:1,padding:'11px 13px',borderRadius:12,border:`1.5px solid ${T.inputBorder}`,
              background:T.inputBg,color:T.text,fontFamily:'Inter,sans-serif',fontSize:14,outline:'none'}}/>
          {schedTime&&(
            <button onClick={()=>setSchedTime('')} style={{padding:'10px 14px',borderRadius:12,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:13,cursor:'pointer'}}>✕ Quitar</button>
          )}
        </div>
        {schedTime&&<p style={{color:'rgba(99,102,241,.8)',fontSize:12,marginTop:-10,marginBottom:14}}>⏰ Aparecerá anclado a las {schedTime} en Mi Día</p>}

        <Label T={T}>Color</Label>
        <div style={{display:'flex',gap:9,flexWrap:'wrap',marginBottom:22}}>
          {PALETTE.map(c=>(<div key={c} onClick={()=>setColor(c)} style={{width:32,height:32,borderRadius:'50%',background:c,cursor:'pointer',border:color===c?'3px solid #fff':'3px solid transparent',boxShadow:color===c?'0 0 0 2px rgba(255,255,255,.25)':'none',transition:'all .15s'}}/>))}
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer'}}>Cancelar</button>
          <button onClick={submit} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:600,cursor:'pointer'}}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Label helper ─────────────────────────────────────────────
function Label({ T, children }) {
  return <p style={{color:T.textDim,fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'.09em',marginBottom:9}}>{children}</p>;
}

// ─── Habit Rows ───────────────────────────────────────────────
function HabitRow({ habit, onToggle, onDelete, onEdit, onTimerOpen, idx, today }) {
  const T = useT();
  const [tx,setTx]     = useState(0);
  const [pop,setPop]   = useState(false);
  const [ctx,setCtx]   = useState(false);
  const startX         = useRef(null);
  const longTimer      = useRef(null);
  const didLong        = useRef(false);
  const THRESH         = 70;

  // Frequency check
  const dow = new Date(today+'T12:00:00').getDay();
  const isToday = habit.frequency==='daily' || (habit.frequency==='weekdays'&&dow>=1&&dow<=5) || (habit.frequency==='weekends'&&(dow===0||dow===6));
  const dimmed = !isToday;

  const startLong = () => { didLong.current=false; longTimer.current=setTimeout(()=>{didLong.current=true;setCtx(true);},550); };
  const cancelLong = () => clearTimeout(longTimer.current);

  const handleClick = () => {
    if(dimmed||didLong.current) return;
    if(Math.abs(tx)>10){setTx(0);return;}
    if(habit.type==='timer'){onTimerOpen(habit);return;}
    setPop(true); setTimeout(()=>setPop(false),350);
    onToggle(habit.id);
  };

  const onTouchStart=e=>{startX.current=e.touches[0].clientX;startLong();};
  const onTouchMove=e=>{cancelLong();const dx=e.touches[0].clientX-startX.current;if(dx<0)setTx(Math.max(dx,-110));};
  const onTouchEnd=()=>{cancelLong();if(tx<-THRESH){onDelete(habit);setTx(0);}else setTx(0);};

  const revealPct = Math.min(Math.abs(tx)/THRESH,1);
  const flameIcon = habit.streak>=7?'🔥🔥':habit.streak>=3?'🔥':'🌱';

  // For counter type, handle + button
  if (habit.type==='counter') {
    const count = habit.count||0;
    const tgt   = habit.target||8;
    const cpct  = Math.min(Math.round(count/tgt*100),100);
    return (
      <div className="fade-up" style={{animationDelay:`${idx*55}ms`}}>
        <div style={{background:T.rowBg,border:`1px solid ${T.rowBorder}`,borderRadius:18,padding:'12px 14px',opacity:dimmed?.4:1}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:44,height:44,borderRadius:14,background:habit.done?T.chipInactive:habit.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,filter:habit.done?'grayscale(1)':'none'}}>
              {habit.icon}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{color:habit.done?T.textDim:T.text,fontSize:14,fontWeight:600,textDecoration:habit.done?'line-through':'none'}}>{habit.name}</p>
              <p style={{color:T.textFaint,fontSize:11}}>{CAT_IC[habit.category]} {habit.category}{habit.streak>0?` · ${flameIcon} ${habit.streak}d`:''}</p>
            </div>
            <span style={{color:T.textDim,fontSize:13,fontWeight:700,fontVariantNumeric:'tabular-nums'}}>{count}/{tgt}</span>
          </div>
          {/* Progress bar */}
          <div style={{height:4,background:T.chipInactive,borderRadius:99,overflow:'hidden',marginBottom:10}}>
            <div style={{height:'100%',width:`${cpct}%`,background:`linear-gradient(90deg,${habit.color},${habit.color}99)`,borderRadius:99,transition:'width .4s ease'}}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>count>0&&onToggle(habit.id,'dec')} style={{flex:1,padding:'8px',borderRadius:12,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,cursor:'pointer',fontSize:18,color:T.text}}>−</button>
            <button onClick={()=>onToggle(habit.id,'inc')} style={{flex:2,padding:'8px',borderRadius:12,border:'none',background:`linear-gradient(135deg,${habit.color},${habit.color}99)`,cursor:'pointer',fontSize:14,fontWeight:700,color:'#fff'}}>+1 {count<tgt?`→ ${tgt-count} más`:' ✓'}</button>
          </div>
        </div>
        {ctx&&<ContextMenu habit={habit} onEdit={()=>{setCtx(false);onEdit(habit);}} onDelete={()=>{setCtx(false);onDelete(habit);}} onClose={()=>setCtx(false)}/>}
      </div>
    );
  }

  // Boolean + Timer type
  return (
    <>
      <div className="fade-up" style={{position:'relative',borderRadius:18,overflow:'hidden',animationDelay:`${idx*55}ms`,opacity:dimmed?.4:1}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent 30%,rgba(239,68,68,.8))',borderRadius:18,display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:20,opacity:revealPct}}>
          <span style={{fontSize:18}}>🗑</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'13px 14px',background:T.rowBg,border:`1px solid ${T.rowBorder}`,borderRadius:18,cursor:dimmed?'default':'pointer',userSelect:'none',transform:`translateX(${tx}px)`,transition:tx===0?'transform .3s ease':'none',opacity:habit.done?.55:1}}
          onClick={handleClick}
          onMouseDown={e=>{startX.current=e.clientX;startLong();}}
          onMouseMove={e=>{if(startX.current===null)return;cancelLong();const dx=e.clientX-startX.current;if(dx<0)setTx(Math.max(dx,-110));}}
          onMouseUp={()=>{cancelLong();if(tx<-THRESH)onDelete(habit);setTx(0);startX.current=null;}}
          onMouseLeave={()=>{cancelLong();setTx(0);startX.current=null;}}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <div style={{width:44,height:44,borderRadius:14,background:habit.done?T.chipInactive:habit.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,filter:habit.done?'grayscale(1)':'none',transition:'filter .2s'}}>
            {habit.icon}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{color:habit.done?T.textDim:T.text,fontSize:14,fontWeight:600,lineHeight:1.2,textDecoration:habit.done?'line-through':'none',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{habit.name}</p>
            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3,flexWrap:'wrap'}}>
              <span style={{fontSize:11,color:T.textFaint,fontWeight:500}}>{CAT_IC[habit.category]} {habit.category}</span>
              {!dimmed&&(habit.streak||0)>0&&<span style={{fontSize:11,color:'#f97316',fontWeight:600,background:'rgba(249,115,22,.12)',padding:'1px 7px',borderRadius:99}}>{flameIcon} {habit.streak}d</span>}
              {dimmed&&<span style={{fontSize:10,color:T.textFaint}}>· No toca hoy</span>}
              {habit.type==='timer'&&!habit.done&&<span style={{fontSize:10,color:habit.color,fontWeight:600,background:habit.color+'15',padding:'1px 7px',borderRadius:99}}>⏱ Toca para cronometrar</span>}
            </div>
          </div>
          {habit.type==='timer'?(
            <div style={{width:36,height:36,borderRadius:'50%',flexShrink:0,background:habit.done?habit.color:'rgba(99,102,241,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
              {habit.done?'✓':'▶'}
            </div>
          ):(
            <div style={{width:28,height:28,borderRadius:'50%',flexShrink:0,background:habit.done?habit.color:'transparent',border:`2px solid ${habit.done?habit.color:T.textFaint}`,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .22s'}}>
              {habit.done&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" style={{animation:'checkBounce .28s ease both'}}><path d="M20 6L9 17l-5-5"/></svg>}
            </div>
          )}
        </div>
      </div>
      {ctx&&<ContextMenu habit={habit} onEdit={()=>{setCtx(false);onEdit(habit);}} onDelete={()=>{setCtx(false);onDelete(habit);}} onClose={()=>setCtx(false)}/>}
    </>
  );
}

// ─── Onboarding ───────────────────────────────────────────────
function Onboarding({ onDone }) {
  const T = useT();
  const [step,setStep]     = useState(0);
  const [selected,setSelected] = useState(new Set());
  const toggle = i=>setSelected(p=>{const s=new Set(p);s.has(i)?s.delete(i):s.add(i);return s;});
  const finish = ()=>{
    const habits=[...selected].map(i=>({id:crypto.randomUUID(),...SUGGESTED[i],done:false,streak:0,lastDate:null,history:{},count:0,timeSpent:0}));
    onDone(habits);
  };
  const S = {sheetBg:T.sheetBg,text:T.text,textDim:T.textDim,chipInactive:T.chipInactive,cardBorder:T.cardBorder};
  return (
    <div style={{position:'absolute',inset:0,zIndex:60,background:T.appBg,display:'flex',flexDirection:'column',animation:'onboardIn .5s ease both'}}>
      <div style={{flex:1,overflow:'auto',padding:'24px 20px 20px'}}>
        {step===0?(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',textAlign:'center',gap:14,paddingBottom:40}}>
            <div style={{fontSize:64,marginBottom:4}}>🌟</div>
            <h1 style={{fontSize:26,fontWeight:900,background:'linear-gradient(135deg,#6366f1,#ec4899)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.15}}>Micro-Hábitos</h1>
            <p style={{color:T.textDim,fontSize:15,lineHeight:1.6,maxWidth:240}}>Construye rutinas poderosas, un pequeño hábito a la vez.</p>
            <div style={{display:'flex',flexDirection:'column',gap:10,width:'100%',marginTop:16}}>
              {[['⚡','Seguimiento diario'],['🔥','Rachas motivadoras'],['🏆','Logros desbloqueables'],['⏱','Temporizador integrado'],['🤖','Sugerencias con IA']].map(([ic,tx])=>(
                <div key={tx} style={{display:'flex',alignItems:'center',gap:12,background:S.chipInactive,border:`1px solid ${S.cardBorder}`,borderRadius:16,padding:'13px 16px',textAlign:'left'}}>
                  <span style={{fontSize:20}}>{ic}</span>
                  <span style={{color:T.text,fontSize:13,fontWeight:500}}>{tx}</span>
                </div>
              ))}
            </div>
          </div>
        ):(
          <>
            <p style={{color:T.textDim,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Paso 2 de 2</p>
            <h2 style={{color:T.text,fontSize:20,fontWeight:800,marginBottom:4}}>Elige tus primeros hábitos</h2>
            <p style={{color:T.textDim,fontSize:13,marginBottom:18}}>Selecciona los que quieres trabajar</p>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {SUGGESTED.map((s,i)=>{
                const on=selected.has(i);
                return (
                  <div key={i} onClick={()=>toggle(i)} style={{display:'flex',alignItems:'center',gap:12,background:on?s.color+'22':S.chipInactive,border:`1.5px solid ${on?s.color+'66':S.cardBorder}`,borderRadius:16,padding:'12px 14px',cursor:'pointer',transition:'all .18s'}}>
                    <span style={{fontSize:22}}>{s.icon}</span>
                    <div style={{flex:1}}>
                      <p style={{color:T.text,fontSize:13,fontWeight:600}}>{s.name}</p>
                      <p style={{color:T.textDim,fontSize:11,marginTop:2}}>{CAT_IC[s.category]} {s.category} · {s.type==='timer'?`⏱ ${s.target/60}min`:s.type==='counter'?`🔢 Meta: ${s.target}`:'✅ Completar'}</p>
                    </div>
                    <div style={{width:24,height:24,borderRadius:'50%',flexShrink:0,background:on?s.color:'transparent',border:`2px solid ${on?s.color:T.textFaint}`,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .18s'}}>
                      {on&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <div style={{padding:'0 20px 40px',flexShrink:0}}>
        {step===0?(
          <button onClick={()=>setStep(1)} style={{width:'100%',padding:'15px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:600,cursor:'pointer'}}>Empezar →</button>
        ):(
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>setStep(0)} style={{padding:'14px 18px',borderRadius:16,border:`1px solid ${S.cardBorder}`,background:S.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer'}}>← Atrás</button>
            <button onClick={finish} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:600,cursor:'pointer',opacity:selected.size>0?1:.55}}>
              {selected.size>0?`Añadir ${selected.size} hábito${selected.size!==1?'s':''} ✦`:'Omitir'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Export all to window
Object.assign(window, {
  ThemeCtx, useT, Ring, useToast, ToastContainer, Confetti, AmbientBg, Counter, Ic,
  ContextMenu, DeleteSheet, TimerSheet, AISheet, AddSheet, EditSheet, Label,
  HabitRow, Onboarding, TOAST_MSGS,
});
