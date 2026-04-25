// ─── app-extras.jsx — Features adicionales de Ripple ──────────

// ─── XP System ────────────────────────────────────────────────
const XP_KEY = 'mh4_xp';
const XP_LOG_KEY = 'mh4_xp_log';

function loadXP() {
  try { return parseInt(localStorage.getItem(XP_KEY)||'0',10); } catch { return 0; }
}
function saveXP(v) { localStorage.setItem(XP_KEY, String(v)); }

function XPBar({ xp }) {
  const T = useT();
  const level  = Math.floor(xp / 100) + 1;
  const pct    = (xp % 100);
  const labels = ['Principiante','Aprendiz','Constante','Dedicado','Experto','Maestro','Leyenda'];
  const label  = labels[Math.min(level-1, labels.length-1)];
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:14,background:T.chipInactive,border:`1px solid ${T.cardBorder}`}}>
      <div style={{width:36,height:36,borderRadius:12,background:'linear-gradient(135deg,#f59e0b,#f97316)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,boxShadow:'0 3px 10px rgba(245,158,11,.35)'}}>⭐</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
          <span style={{color:T.text,fontSize:13,fontWeight:700}}>Nivel {level} · {label}</span>
          <span style={{color:'#f59e0b',fontSize:12,fontWeight:700}}>{xp} XP</span>
        </div>
        <div style={{height:5,background:T.ringBg,borderRadius:99,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#f59e0b,#f97316)',borderRadius:99,transition:'width .8s ease'}}/>
        </div>
        <span style={{color:T.textFaint,fontSize:10,marginTop:2,display:'block'}}>{100-pct} XP para nivel {level+1}</span>
      </div>
    </div>
  );
}

// ─── Streak Celebration ────────────────────────────────────────
function StreakCelebration({ streak, onClose }) {
  const T = useT();
  const { useState: uS, useEffect: uE } = React;
  const [show, setShow] = uS(false);
  uE(() => { setTimeout(() => setShow(true), 50); }, []);

  const milestones = {
    3:  { icon:'🔥', title:'¡Racha de 3 días!',  subtitle:'Estás en el camino correcto.',     xp:100,  color:'#f97316' },
    7:  { icon:'⚡', title:'¡Semana perfecta!',   subtitle:'Una semana entera. ¡Increíble!',   xp:200,  color:'#eab308' },
    14: { icon:'💫', title:'¡Dos semanas!',        subtitle:'La constancia se vuelve hábito.',  xp:350,  color:'#8b5cf6' },
    30: { icon:'💎', title:'¡30 días seguidos!',   subtitle:'Eres un maestro de los hábitos.',  xp:500,  color:'#06b6d4' },
    60: { icon:'🏆', title:'¡60 días!',            subtitle:'Esto ya es parte de ti.',          xp:1000, color:'#ec4899' },
    100:{ icon:'👑', title:'¡100 días!',           subtitle:'Leyenda absoluta.',                xp:2000, color:'#6366f1' },
  };
  const m = milestones[streak] || { icon:'🔥', title:`¡${streak} días!`, subtitle:'¡Sigue así!', xp:50, color:'#f97316' };

  return (
    <div style={{position:'absolute',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.85)',backdropFilter:'blur(20px)',opacity:show?1:0,transition:'opacity .4s'}}>
      {/* Confetti particles */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        {Array.from({length:40},(_,i)=>{
          const angle=(i/40)*360, dist=80+Math.random()*150;
          return <div key={i} style={{position:'absolute',left:'50%',top:'40%',width:8+Math.random()*6,height:8+Math.random()*6,borderRadius:Math.random()>.5?'50%':'2px',background:PALETTE[i%PALETTE.length],animation:`burst 2s cubic-bezier(.22,.61,.36,1) ${Math.random()*.5}s forwards`,'--tx':`${Math.cos(angle*Math.PI/180)*dist}px`,'--ty':`${Math.sin(angle*Math.PI/180)*dist}px`,'--spin':`${(Math.random()-.5)*720}deg`}}/>;
        })}
      </div>

      <div style={{textAlign:'center',padding:'0 32px',transform:show?'scale(1)':'scale(.8)',transition:'transform .5s cubic-bezier(.34,1.56,.64,1) .1s'}}>
        <div style={{fontSize:72,marginBottom:16,filter:`drop-shadow(0 0 30px ${m.color}88)`,animation:'pop .6s ease .2s both'}}>{m.icon}</div>
        <p style={{color:'#fff',fontSize:28,fontWeight:900,marginBottom:8,lineHeight:1.2}}>{m.title}</p>
        <p style={{color:'rgba(255,255,255,.65)',fontSize:16,marginBottom:24,lineHeight:1.5}}>{m.subtitle}</p>

        <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:99,background:`linear-gradient(135deg,${m.color}33,${m.color}11)`,border:`1px solid ${m.color}55`,marginBottom:32}}>
          <span style={{fontSize:20}}>⭐</span>
          <span style={{color:m.color,fontSize:18,fontWeight:800}}>+{m.xp} XP</span>
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginBottom:32}}>
          {[3,7,14,30,60,100].map(n=>(
            <div key={n} style={{width:n<=streak?32:24,height:n<=streak?32:24,borderRadius:'50%',background:n<=streak?m.color:T.chipInactive,display:'flex',alignItems:'center',justifyContent:'center',fontSize:n<=streak?14:11,fontWeight:700,color:n<=streak?'#fff':T.textFaint,transition:'all .3s',border:n===streak?`3px solid #fff`:'none'}}>{milestones[n]?.icon||''}</div>
          ))}
        </div>

        <button onClick={onClose} style={{padding:'16px 48px',borderRadius:99,border:'none',background:`linear-gradient(135deg,${m.color},${m.color}99)`,color:'#fff',fontFamily:'Inter,sans-serif',fontSize:16,fontWeight:700,cursor:'pointer',boxShadow:`0 8px 28px ${m.color}55`}}>
          ¡Seguir así! 🚀
        </button>
      </div>
    </div>
  );
}

// ─── Habit Note Sheet ──────────────────────────────────────────
function HabitNoteSheet({ habit, onClose, onSave }) {
  const T = useT();
  const { useState: uS, useRef: uR, useEffect: uE } = React;
  const today = todayStr();
  const [note, setNote] = uS(habit.dailyNotes?.[today] || '');
  const [mood, setMood] = uS(habit.dailyMoods?.[today] || null);
  const ref = uR(null);
  uE(() => { setTimeout(() => ref.current?.focus(), 350); }, []);

  const moods = [
    { id:'great', emoji:'🤩', label:'Genial' },
    { id:'good',  emoji:'😊', label:'Bien'   },
    { id:'ok',    emoji:'😐', label:'Regular'},
    { id:'hard',  emoji:'😔', label:'Difícil'},
  ];

  const save = () => {
    onSave(habit.id, {
      dailyNotes: { ...(habit.dailyNotes||{}), [today]: note },
      dailyMoods: { ...(habit.dailyMoods||{}), [today]: mood },
    });
    onClose();
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet" style={{background:T.sheetBg}}>
        <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
          <div style={{width:46,height:46,borderRadius:14,background:habit.color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{habit.icon}</div>
          <div>
            <p style={{color:T.text,fontSize:16,fontWeight:700}}>{habit.name}</p>
            <p style={{color:T.textDim,fontSize:12,marginTop:2}}>Nota de hoy · {new Date().toLocaleDateString('es',{weekday:'long',day:'numeric',month:'short'})}</p>
          </div>
        </div>

        <p style={{color:T.textDim,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>¿Cómo te fue?</p>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {moods.map(m=>(
            <button key={m.id} onClick={()=>setMood(m.id)} style={{flex:1,padding:'10px 4px',borderRadius:12,border:`1.5px solid ${mood===m.id?habit.color:T.cardBorder}`,background:mood===m.id?habit.color+'22':T.chipInactive,cursor:'pointer',transition:'all .18s'}}>
              <div style={{fontSize:22}}>{m.emoji}</div>
              <div style={{color:mood===m.id?habit.color:T.textDim,fontSize:10,fontWeight:600,marginTop:3}}>{m.label}</div>
            </button>
          ))}
        </div>

        <p style={{color:T.textDim,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Notas</p>
        <textarea ref={ref} value={note} onChange={e=>setNote(e.target.value)}
          placeholder="¿Cómo fue este hábito hoy? ¿Qué notaste?..."
          rows={4}
          style={{width:'100%',background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,borderRadius:14,padding:'12px 14px',color:T.text,fontFamily:'Inter,sans-serif',fontSize:14,resize:'none',outline:'none',marginBottom:18,lineHeight:1.5}}/>

        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer'}}>Cancelar</button>
          <button onClick={save} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${habit.color},${habit.color}99)`,color:'#fff',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:600,cursor:'pointer'}}>Guardar nota ✓</button>
        </div>
      </div>
    </div>
  );
}

// ─── Share Progress Sheet ──────────────────────────────────────
function ShareProgressSheet({ habits, meta, onClose }) {
  const T = useT();
  const { useState: uS } = React;
  const [copied, setCopied] = uS(false);

  const done       = habits.filter(h=>h.done).length;
  const total      = habits.length;
  const maxStreak  = habits.reduce((m,h)=>Math.max(m,h.streak||0),0);
  const pct        = total===0?0:Math.round(done/total*100);
  const name       = meta?.profile?.name || 'yo';
  const today      = new Date().toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'});

  const text = `🌊 Ripple · Mi progreso de hoy\n\n📅 ${today}\n👤 ${name}\n\n✅ ${done}/${total} hábitos completados (${pct}%)\n🔥 Racha más larga: ${maxStreak} días\n\nMis hábitos:\n${habits.slice(0,5).map(h=>`${h.done?'✅':'⬜'} ${h.icon} ${h.name}`).join('\n')}${habits.length>5?`\n...y ${habits.length-5} más`:''}\n\n💪 Pequeños hábitos, mejor versión de ti.\n#Ripple #Hábitos #MejorVersionDeMi`;

  const copy = () => {
    navigator.clipboard?.writeText(text).then(()=>{
      setCopied(true);
      setTimeout(()=>setCopied(false),2000);
    }).catch(()=>{});
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet" style={{background:T.sheetBg}}>
        <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
        <p style={{color:T.text,fontSize:18,fontWeight:700,marginBottom:4}}>Compartir progreso 📤</p>
        <p style={{color:T.textDim,fontSize:13,marginBottom:16}}>Comparte tu avance de hoy</p>

        {/* Preview card */}
        <div style={{padding:'18px',borderRadius:20,background:'linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.08))',border:`1px solid ${T.accentBorder}`,marginBottom:18}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
            <div style={{width:42,height:42,borderRadius:12,background:T.accentGrad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🌊</div>
            <div>
              <p style={{color:T.text,fontSize:15,fontWeight:800}}>Ripple · {today}</p>
              <p style={{color:T.textDim,fontSize:12}}>{name}</p>
            </div>
          </div>
          <div style={{display:'flex',gap:16,marginBottom:14}}>
            <div style={{textAlign:'center'}}>
              <p style={{color:T.text,fontSize:24,fontWeight:900}}>{pct}%</p>
              <p style={{color:T.textDim,fontSize:11}}>completado</p>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{color:T.text,fontSize:24,fontWeight:900}}>{done}/{total}</p>
              <p style={{color:T.textDim,fontSize:11}}>hábitos</p>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{color:'#f97316',fontSize:24,fontWeight:900}}>{maxStreak}🔥</p>
              <p style={{color:T.textDim,fontSize:11}}>racha</p>
            </div>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {habits.slice(0,6).map(h=>(
              <div key={h.id} style={{padding:'4px 10px',borderRadius:99,background:h.done?h.color+'22':T.chipInactive,border:`1px solid ${h.done?h.color+'44':T.cardBorder}`,fontSize:12,color:h.done?h.color:T.textDim,fontWeight:600}}>
                {h.icon} {h.done?'✓':''}
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer'}}>Cerrar</button>
          <button onClick={copy} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:copied?'linear-gradient(135deg,#22c55e,#16a34a)':'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:600,cursor:'pointer',transition:'background .3s'}}>
            {copied?'¡Copiado! ✓':'Copiar texto 📋'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vacation Mode Banner ──────────────────────────────────────
function VacationBanner({ onDisable }) {
  const T = useT();
  return (
    <div style={{margin:'0 16px 8px',padding:'10px 14px',borderRadius:14,background:'linear-gradient(135deg,rgba(6,182,212,.15),rgba(8,145,178,.08))',border:'1px solid rgba(6,182,212,.3)',display:'flex',alignItems:'center',gap:10}}>
      <span style={{fontSize:20}}>🏖️</span>
      <div style={{flex:1}}>
        <p style={{color:'#06b6d4',fontSize:13,fontWeight:700}}>Modo vacaciones activo</p>
        <p style={{color:T.textDim,fontSize:11,marginTop:1}}>Las rachas están protegidas</p>
      </div>
      <button onClick={onDisable} style={{padding:'5px 12px',borderRadius:99,border:'1px solid rgba(6,182,212,.4)',background:'rgba(6,182,212,.15)',color:'#06b6d4',fontFamily:'Inter,sans-serif',fontSize:11,fontWeight:600,cursor:'pointer'}}>Volver</button>
    </div>
  );
}

// ─── Template Selector ─────────────────────────────────────────
const HABIT_TEMPLATES = [
  {
    id:'fitness', label:'Fitness', icon:'💪', color:'#ef4444',
    desc:'Rutina de ejercicio y salud física',
    habits:[
      {name:'Ejercicio 30min',icon:'🏋️',color:'#ef4444',category:'Fitness',type:'timer',target:1800,frequency:'daily'},
      {name:'Caminar 10.000 pasos',icon:'🚶',color:'#f97316',category:'Fitness',type:'boolean',target:1,frequency:'daily'},
      {name:'Beber 2L de agua',icon:'💧',color:'#06b6d4',category:'Salud',type:'counter',target:8,frequency:'daily'},
      {name:'Dormir 8 horas',icon:'😴',color:'#8b5cf6',category:'Salud',type:'boolean',target:1,frequency:'daily'},
    ]
  },
  {
    id:'mente', label:'Bienestar mental', icon:'🧘', color:'#8b5cf6',
    desc:'Mindfulness y salud mental',
    habits:[
      {name:'Meditar',icon:'🧘',color:'#8b5cf6',category:'Mente',type:'timer',target:300,frequency:'daily'},
      {name:'Journaling',icon:'✍️',color:'#a855f7',category:'Personal',type:'boolean',target:1,frequency:'daily'},
      {name:'Leer 20 minutos',icon:'📚',color:'#f97316',category:'Mente',type:'timer',target:1200,frequency:'daily'},
      {name:'Sin redes sociales antes de dormir',icon:'📵',color:'#ec4899',category:'Personal',type:'boolean',target:1,frequency:'daily'},
    ]
  },
  {
    id:'productividad', label:'Productividad', icon:'🎯', color:'#6366f1',
    desc:'Trabajo y aprendizaje constante',
    habits:[
      {name:'Revisar tareas del día',icon:'📋',color:'#6366f1',category:'Trabajo',type:'boolean',target:1,frequency:'weekdays'},
      {name:'Estudiar 1 hora',icon:'📝',color:'#3b82f6',category:'Trabajo',type:'timer',target:3600,frequency:'daily'},
      {name:'Sin procrastinar',icon:'⚡',color:'#eab308',category:'Trabajo',type:'boolean',target:1,frequency:'weekdays'},
      {name:'Aprender algo nuevo',icon:'🧠',color:'#22c55e',category:'Mente',type:'boolean',target:1,frequency:'daily'},
    ]
  },
  {
    id:'nutricion', label:'Nutrición', icon:'🥗', color:'#22c55e',
    desc:'Alimentación saludable',
    habits:[
      {name:'Comer verduras',icon:'🥦',color:'#22c55e',category:'Salud',type:'boolean',target:1,frequency:'daily'},
      {name:'Sin azúcar',icon:'🚫',color:'#ef4444',category:'Salud',type:'boolean',target:1,frequency:'daily'},
      {name:'Desayuno saludable',icon:'🥗',color:'#14b8a6',category:'Salud',type:'boolean',target:1,frequency:'daily'},
      {name:'Sin alcohol',icon:'🚱',color:'#f97316',category:'Salud',type:'boolean',target:1,frequency:'daily'},
    ]
  },
];

function TemplateSheet({ onAdd, onClose }) {
  const T = useT();
  const { useState: uS } = React;
  const [selected, setSelected] = uS(null);
  const [added, setAdded] = uS(false);

  const confirm = () => {
    const tmpl = HABIT_TEMPLATES.find(t=>t.id===selected);
    if (!tmpl) return;
    tmpl.habits.forEach(h => onAdd({...h, done:false, streak:0, lastDate:null, history:{}, count:0, timeSpent:0}));
    setAdded(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet" style={{background:T.sheetBg,maxHeight:'88%',overflowY:'auto'}}>
        <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
        <p style={{color:T.text,fontSize:18,fontWeight:700,marginBottom:4}}>Plantillas de hábitos 📋</p>
        <p style={{color:T.textDim,fontSize:13,marginBottom:18}}>Elige un objetivo y añade hábitos de golpe</p>

        {added ? (
          <div style={{textAlign:'center',padding:'30px 0'}}>
            <div style={{fontSize:52,marginBottom:12}}>🎉</div>
            <p style={{color:T.text,fontSize:18,fontWeight:700}}>¡Hábitos añadidos!</p>
          </div>
        ) : (
          <>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:22}}>
              {HABIT_TEMPLATES.map(tmpl=>{
                const sel = selected===tmpl.id;
                return (
                  <div key={tmpl.id} onClick={()=>setSelected(sel?null:tmpl.id)} style={{padding:'14px 16px',borderRadius:18,cursor:'pointer',background:sel?tmpl.color+'18':T.chipInactive,border:`2px solid ${sel?tmpl.color+'55':T.cardBorder}`,transition:'all .2s'}}>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:sel?12:0}}>
                      <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${tmpl.color},${tmpl.color}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:`0 4px 12px ${tmpl.color}44`}}>{tmpl.icon}</div>
                      <div style={{flex:1}}>
                        <p style={{color:T.text,fontSize:15,fontWeight:700}}>{tmpl.label}</p>
                        <p style={{color:T.textDim,fontSize:12,marginTop:2}}>{tmpl.desc} · {tmpl.habits.length} hábitos</p>
                      </div>
                      <div style={{width:24,height:24,borderRadius:'50%',background:sel?tmpl.color:'transparent',border:`2px solid ${sel?tmpl.color:T.textFaint}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {sel&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                      </div>
                    </div>
                    {sel&&(
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        {tmpl.habits.map((h,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:T.rowBg,borderRadius:10}}>
                            <span style={{fontSize:16}}>{h.icon}</span>
                            <span style={{flex:1,color:T.text,fontSize:13,fontWeight:500}}>{h.name}</span>
                            <span style={{fontSize:10,color:T.textDim,background:T.chipInactive,padding:'2px 8px',borderRadius:99}}>{h.type==='timer'?`⏱ ${h.target/60}min`:h.type==='counter'?`🔢 ${h.target}x`:'✅'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={onClose} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer'}}>Cancelar</button>
              <button onClick={confirm} style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:selected?'linear-gradient(135deg,#6366f1,#8b5cf6)':'rgba(99,102,241,.25)',color:selected?'#fff':'rgba(255,255,255,.4)',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:600,cursor:selected?'pointer':'default',transition:'all .2s'}}>
                {selected?`Añadir ${HABIT_TEMPLATES.find(t=>t.id===selected)?.habits.length} hábitos ✦`:'Selecciona una plantilla'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Backup & Restore Sheet ────────────────────────────────────
function BackupSheet({ onClose }) {
  const T = useT();
  const { useState: uS, useRef: uR } = React;
  const [status, setStatus] = uS(null);
  const fileRef = uR(null);

  const exportBackup = () => {
    const keys = Object.keys(localStorage).filter(k=>k.startsWith('mh4'));
    const data = {};
    keys.forEach(k=>{ try { data[k]=JSON.parse(localStorage.getItem(k)); } catch { data[k]=localStorage.getItem(k); }});
    data.__version = 1;
    data.__date = new Date().toISOString();
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `ripple-backup-${todayStr()}.json`;
    a.click(); URL.revokeObjectURL(url);
    setStatus({ok:true, msg:'¡Backup descargado!'});
  };

  const importBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.__version) throw new Error('invalid');
        Object.keys(data).filter(k=>!k.startsWith('__')).forEach(k=>{
          localStorage.setItem(k, JSON.stringify(data[k]));
        });
        setStatus({ok:true, msg:'¡Datos restaurados! Recargando...'});
        setTimeout(()=>window.location.reload(), 1500);
      } catch {
        setStatus({ok:false, msg:'Archivo inválido. Intenta con otro.'});
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet" style={{background:T.sheetBg}}>
        <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
        <p style={{color:T.text,fontSize:18,fontWeight:700,marginBottom:4}}>Backup & Restaurar 💾</p>
        <p style={{color:T.textDim,fontSize:13,marginBottom:20}}>Guarda o restaura todos tus datos</p>

        {status && (
          <div style={{padding:'12px 14px',borderRadius:14,background:status.ok?'rgba(34,197,94,.12)':'rgba(239,68,68,.12)',border:`1px solid ${status.ok?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'}`,marginBottom:16}}>
            <p style={{color:status.ok?'#22c55e':'#f87171',fontSize:14,fontWeight:600}}>{status.msg}</p>
          </div>
        )}

        <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:22}}>
          <button onClick={exportBackup} style={{padding:'16px',borderRadius:16,border:`1px solid ${T.accentBorder}`,background:T.accentDim,display:'flex',alignItems:'center',gap:14,cursor:'pointer',textAlign:'left'}}>
            <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>📥</div>
            <div>
              <p style={{color:T.text,fontSize:14,fontWeight:700}}>Exportar backup</p>
              <p style={{color:T.textDim,fontSize:12,marginTop:2}}>Descarga un archivo .json con todos tus datos</p>
            </div>
          </button>

          <button onClick={()=>fileRef.current?.click()} style={{padding:'16px',borderRadius:16,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,display:'flex',alignItems:'center',gap:14,cursor:'pointer',textAlign:'left'}}>
            <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>📤</div>
            <div>
              <p style={{color:T.text,fontSize:14,fontWeight:700}}>Restaurar backup</p>
              <p style={{color:T.textDim,fontSize:12,marginTop:2}}>Carga un archivo .json guardado antes</p>
            </div>
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={importBackup} style={{display:'none'}}/>
        </div>

        <button onClick={onClose} style={{width:'100%',padding:'14px',borderRadius:16,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer'}}>Cerrar</button>
      </div>
    </div>
  );
}

// ─── Mood History ──────────────────────────────────────────────
const MOOD_KEY_PREFIX = 'mh4_mood_';
function saveDayMood(dateStr, mood) { localStorage.setItem(MOOD_KEY_PREFIX+dateStr, mood); }
function loadDayMood(dateStr) { return localStorage.getItem(MOOD_KEY_PREFIX+dateStr)||null; }

function MoodHistoryWidget() {
  const T = useT();
  const { useMemo: uM } = React;
  const last7 = uM(()=>dateRange(7),[]);
  const moods = { great:'🤩', good:'😊', ok:'😐', hard:'😔', rough:'😩' };
  return (
    <div style={{display:'flex',gap:6,justifyContent:'space-between'}}>
      {last7.map(d=>{
        const m = loadDayMood(d);
        const isToday = d===todayStr();
        return (
          <div key={d} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <div style={{width:36,height:36,borderRadius:10,background:isToday?T.accentDim:T.chipInactive,border:`1px solid ${isToday?T.accentBorder:T.cardBorder}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:m?20:14,color:T.textFaint}}>
              {m?moods[m]:'·'}
            </div>
            <span style={{fontSize:9,color:isToday?T.accentText:T.textFaint,fontWeight:isToday?700:400}}>{DAYS[dowOf(d)]}</span>
          </div>
        );
      })}
    </div>
  );
}

// Export all to window
Object.assign(window, {
  XPBar, loadXP, saveXP, XP_KEY,
  StreakCelebration,
  HabitNoteSheet,
  ShareProgressSheet,
  VacationBanner,
  TemplateSheet,
  BackupSheet,
  MoodHistoryWidget,
  saveDayMood, loadDayMood,
  HABIT_TEMPLATES,
});
