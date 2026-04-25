// ─── app-constants.js — shared constants & utilities ────────
const PALETTE = ['#6366f1','#8b5cf6','#a855f7','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6','#f43f5e'];
const CATS    = ['Todos','Salud','Mente','Fitness','Trabajo','Personal'];
const CAT_IC  = { Todos:'⚡', Salud:'🍎', Mente:'🧘', Fitness:'💪', Trabajo:'💼', Personal:'✨' };
const HABIT_ICS = ['🏃','🧘','💧','📚','🥗','😴','🧠','💊','🎯','✍️','🎵','🌿','🏋️','🧹','🚴','☀️','🛁','🥦','📝','🎨','🤸','🦷','🥤','🌙','🏊'];
const DAYS      = ['D','L','M','M','J','V','S'];
const DAYS_FULL = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const FREQ_OPTS = [
  { id:'daily',    label:'Diario',         icon:'📅' },
  { id:'weekdays', label:'Lun–Vie',        icon:'💼' },
  { id:'weekends', label:'Sáb–Dom',        icon:'🌅' },
];
const QUOTES = [
  "Pequeños pasos, grandes cambios.",
  "La consistencia supera a la intensidad.",
  "Un hábito a la vez.",
  "El progreso, no la perfección.",
  "Los hábitos son el interés compuesto de la mejora.",
  "Sé hoy quien quieres ser mañana.",
  "No se trata de motivación, sino de disciplina.",
];
const SUGGESTED = [
  { name:'Beber 2L de agua', icon:'💧', color:'#06b6d4', category:'Salud',   type:'counter', target:8,   frequency:'daily' },
  { name:'Meditar',          icon:'🧘', color:'#8b5cf6', category:'Mente',   type:'timer',   target:300, frequency:'daily' },
  { name:'Salir a caminar',  icon:'🏃', color:'#22c55e', category:'Fitness', type:'timer',   target:1800,frequency:'daily' },
  { name:'Leer',             icon:'📚', color:'#f97316', category:'Mente',   type:'timer',   target:1200,frequency:'daily' },
  { name:'Dormir 8 horas',   icon:'😴', color:'#6366f1', category:'Salud',   type:'boolean', target:1,   frequency:'daily' },
  { name:'Sin azúcar',       icon:'🥗', color:'#14b8a6', category:'Salud',   type:'boolean', target:1,   frequency:'daily' },
  { name:'Ejercicio',        icon:'🏋️', color:'#ef4444', category:'Fitness', type:'timer',   target:1800,frequency:'weekdays' },
  { name:'Journaling',       icon:'✍️', color:'#eab308', category:'Personal',type:'boolean', target:1,   frequency:'daily' },
];
const ACHIEVEMENTS = [
  { id:'first',    icon:'🌱', label:'Primer hábito',    desc:'Añade tu primer hábito',              color:'#22c55e', check:(h,m) => h.length>=1 },
  { id:'five',     icon:'✋', label:'Cinco hábitos',    desc:'Ten 5 hábitos activos a la vez',       color:'#6366f1', check:(h,m) => h.length>=5 },
  { id:'streak3',  icon:'🔥', label:'En racha',         desc:'Mantén 3 días seguidos en un hábito', color:'#f97316', check:(h,m) => h.some(x=>(x.streak||0)>=3) },
  { id:'streak7',  icon:'⚡', label:'Semana perfecta',  desc:'7 días seguidos en un hábito',        color:'#eab308', check:(h,m) => h.some(x=>(x.streak||0)>=7) },
  { id:'allday',   icon:'🏆', label:'Día perfecto',     desc:'Completa todos tus hábitos en un día', color:'#a855f7', check:(h,m) => m.hadPerfectDay },
  { id:'variety',  icon:'🌈', label:'Variedad',         desc:'Hábitos en 3 categorías distintas',   color:'#ec4899', check:(h,m) => new Set(h.map(x=>x.category)).size>=3 },
  { id:'counter',  icon:'🔢', label:'Contador',         desc:'Usa un hábito de tipo contador',      color:'#06b6d4', check:(h,m) => h.some(x=>x.type==='counter') },
  { id:'timer',    icon:'⏱',  label:'Cronómetro',       desc:'Usa un hábito de tipo temporizador',  color:'#14b8a6', check:(h,m) => h.some(x=>x.type==='timer') },
  { id:'streak30', icon:'💎', label:'Maestro',          desc:'30 días seguidos en un hábito',       color:'#3b82f6', check:(h,m) => h.some(x=>(x.streak||0)>=30) },
];

// ─── Dark / Light themes ─────────────────────────────────────
const DARK = {
  bg:           '#08080f',
  appBg:        '#08080f',
  card:         'rgba(255,255,255,0.055)',
  cardBorder:   'rgba(255,255,255,0.09)',
  rowBg:        'rgba(255,255,255,0.055)',
  rowBorder:    'rgba(255,255,255,0.08)',
  text:         '#ffffff',
  textDim:      'rgba(255,255,255,0.42)',
  textFaint:    'rgba(255,255,255,0.22)',
  inputBg:      'rgba(255,255,255,0.07)',
  inputBorder:  'rgba(255,255,255,0.11)',
  sheetBg:      '#111119',
  tabBg:        'rgba(10,10,18,0.9)',
  tabBorder:    'rgba(255,255,255,0.07)',
  chipInactive: 'rgba(255,255,255,0.06)',
  chipColor:    'rgba(255,255,255,0.4)',
  ringBg:       'rgba(255,255,255,0.08)',
  calFill:      'rgba(255,255,255,0.05)',
  sectionLabel: 'rgba(255,255,255,0.28)',
  isDark:       true,
};
const LIGHT = {
  bg:           '#f0ede8',
  appBg:        '#f5f2ee',
  card:         'rgba(255,255,255,0.88)',
  cardBorder:   'rgba(0,0,0,0.07)',
  rowBg:        'rgba(255,255,255,0.92)',
  rowBorder:    'rgba(0,0,0,0.07)',
  text:         '#111111',
  textDim:      'rgba(0,0,0,0.45)',
  textFaint:    'rgba(0,0,0,0.28)',
  inputBg:      'rgba(0,0,0,0.04)',
  inputBorder:  'rgba(0,0,0,0.1)',
  sheetBg:      '#f8f5f0',
  tabBg:        'rgba(240,237,232,0.94)',
  tabBorder:    'rgba(0,0,0,0.08)',
  chipInactive: 'rgba(0,0,0,0.05)',
  chipColor:    'rgba(0,0,0,0.45)',
  ringBg:       'rgba(0,0,0,0.08)',
  calFill:      'rgba(0,0,0,0.05)',
  sectionLabel: 'rgba(0,0,0,0.3)',
  isDark:       false,
};

// ─── Utils ───────────────────────────────────────────────────
const todayStr  = () => new Date().toISOString().slice(0,10);
const ld = (k,fb)  => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):fb; } catch { return fb; } };
const sv = (k,v)   => localStorage.setItem(k,JSON.stringify(v));

// Date helpers
const dateRange = (days) => Array.from({length:days},(_,i)=>{
  const d = new Date(); d.setDate(d.getDate()-i); return d.toISOString().slice(0,10);
}).reverse();

const dowOf = (dateStr) => new Date(dateStr+'T12:00:00').getDay();

// ─── Audio chime ─────────────────────────────────────────────
function playSuccessChime() {
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    [523.25,659.25,783.99,1046.5].forEach((freq,i)=>{
      const osc=ctx.createOscillator(), gain=ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type='sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime+i*0.13);
      gain.gain.setValueAtTime(0, ctx.currentTime+i*0.13);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime+i*0.13+0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+i*0.13+0.55);
      osc.start(ctx.currentTime+i*0.13);
      osc.stop(ctx.currentTime+i*0.13+0.6);
    });
    setTimeout(()=>ctx.close(),2500);
  } catch(e){}
}

// ─── Accent palettes ──────────────────────────────────────────
const ACCENTS = [
  { id:'indigo',  label:'Índigo',    emoji:'💜', primary:'#6366f1', secondary:'#8b5cf6', rgb:'99,102,241'  },
  { id:'violet',  label:'Violeta',   emoji:'🔮', primary:'#7c3aed', secondary:'#a855f7', rgb:'124,58,237'  },
  { id:'rose',    label:'Rosa',      emoji:'🌸', primary:'#e11d48', secondary:'#f43f5e', rgb:'225,29,72'   },
  { id:'emerald', label:'Esmeralda', emoji:'🌿', primary:'#059669', secondary:'#10b981', rgb:'5,150,105'   },
  { id:'amber',   label:'Ámbar',     emoji:'🌟', primary:'#d97706', secondary:'#f59e0b', rgb:'217,119,6'   },
  { id:'cyan',    label:'Cian',      emoji:'🪻', primary:'#0891b2', secondary:'#06b6d4', rgb:'8,145,178'   },
  { id:'coral',   label:'Coral',     emoji:'🪸', primary:'#dc2626', secondary:'#f97316', rgb:'220,38,38'   },
];

function buildTheme(lightMode, accentId) {
  const a = ACCENTS.find(x => x.id === accentId) || ACCENTS[0];
  const base = lightMode ? LIGHT : DARK;
  return {
    ...base,
    accent:       a.primary,
    accentSec:    a.secondary,
    accentRgb:    a.rgb,
    accentGrad:   'linear-gradient(135deg,' + a.primary + ',' + a.secondary + ')',
    accentDim:    'rgba(' + a.rgb + ',.22)',
    accentBorder: 'rgba(' + a.rgb + ',.4)',
    accentText:   lightMode ? a.primary : a.secondary,
  };
}

// Expose to global scope for Babel-compiled scripts
window.ACCENTS    = ACCENTS;
window.buildTheme = buildTheme;
window.DARK       = DARK;
window.LIGHT      = LIGHT;
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.SUGGESTED  = SUGGESTED;
window.FREQ_OPTS  = FREQ_OPTS;
window.PALETTE    = PALETTE;
window.CATS       = CATS;
window.CAT_IC     = CAT_IC;
window.HABIT_ICS  = HABIT_ICS;
window.DAYS       = DAYS;
window.DAYS_FULL  = DAYS_FULL;
window.QUOTES     = QUOTES;
window.todayStr   = todayStr;
window.ld         = ld;
window.sv         = sv;
window.dateRange  = dateRange;
window.dowOf      = dowOf;
window.playSuccessChime = playSuccessChime;
