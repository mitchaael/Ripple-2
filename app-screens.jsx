// ─── app-screens.jsx — Stats, Logros, Settings screens ───────
const { useState: uS, useEffect: uE, useMemo: uM, useContext: uC } = React;

// ─── Stats Screen ─────────────────────────────────────────────
function StatsScreen({ habits, meta }) {
  const T = useT();
  const [period, setPeriod] = uS('hoy');
  const [expCat, setExpCat] = uS(null);
  const [aiInsight, setAiInsight] = uS(null);
  const [aiLoading, setAiLoading] = uS(false);
  const [mounted, setMounted] = uS(false);
  uE(()=>{ setTimeout(()=>setMounted(true),80); },[]);

  const total = habits.length;
  const done  = habits.filter(h=>h.done).length;
  const pct   = total===0?0:Math.round(done/total*100);
  const maxStreak = habits.reduce((m,h)=>Math.max(m,h.streak||0),0);
  const todayDow  = new Date().getDay();

  // 30-day history data
  const last30 = uM(()=>dateRange(30),[]);
  const last7  = uM(()=>dateRange(7),[]);

  // Per-day completion counts (across all habits) using history
  const dayCount = uM(()=>{
    const map = {};
    last30.forEach(d=>{ map[d]=0; });
    habits.forEach(h=>{
      last30.forEach(d=>{ if(h.history&&h.history[d]) map[d]=(map[d]||0)+1; });
    });
    return map;
  },[habits, last30]);

  // Best day of week
  const bestDow = uM(()=>{
    const counts = [0,0,0,0,0,0,0];
    habits.forEach(h=>{
      if(!h.history) return;
      Object.keys(h.history).forEach(d=>{ if(h.history[d]) counts[dowOf(d)]++; });
    });
    const max = Math.max(...counts);
    return max===0 ? null : { day: DAYS_FULL[counts.indexOf(max)], count: max };
  },[habits]);

  const catStats = CATS.filter(c=>c!=='Todos').map(c=>({
    label:c, habits:habits.filter(h=>h.category===c),
    total:habits.filter(h=>h.category===c).length,
    done:habits.filter(h=>h.category===c&&h.done).length,
  })).filter(c=>c.total>0);

  const loadInsight = () => {
    setAiLoading(true);
    const summary = habits.map(h=>`${h.name}(racha:${h.streak||0},completado:${h.done?'sí':'no'})`).join(', ');
    window.claude.complete(`Eres un coach de hábitos motivador. Analiza este resumen de hábitos del usuario: ${summary||'sin hábitos aún'}. Da un insight breve y motivador de máximo 3 frases en español. Sé específico, personal y positivo. Sin emojis de apertura.`)
      .then(txt=>{ setAiInsight(txt); setAiLoading(false); })
      .catch(()=>{ setAiInsight('¡Sigue construyendo tus hábitos! Cada día que cumples es un ladrillo más en tu mejor versión. La constancia es la clave del éxito.'); setAiLoading(false); });
  };

  const PBtn = ({id,lbl}) => (
    <button onClick={()=>setPeriod(id)} style={{flex:1,padding:'8px 0',border:'none',cursor:'pointer',borderRadius:12,fontFamily:'Inter,sans-serif',fontSize:12,fontWeight:600,background:period===id?'rgba(99,102,241,.3)':'transparent',color:period===id?'#a5b4fc':T.textDim,transition:'all .18s'}}>
      {lbl}
    </button>
  );

  const card = {background:T.card,border:`1px solid ${T.cardBorder}`,borderRadius:22,marginBottom:12};

  return (
    <div style={{flex:1,overflowY:'auto',overflowX:'hidden',padding:'18px 16px 100px'}}>
      <p style={{color:T.text,fontSize:22,fontWeight:800,marginBottom:16}}>Estadísticas 📊</p>

      {/* Period toggle */}
      <div style={{display:'flex',background:T.chipInactive,borderRadius:14,padding:4,marginBottom:16,gap:2,border:`1px solid ${T.cardBorder}`}}>
        <PBtn id="hoy"     lbl="Hoy"/>
        <PBtn id="semana"  lbl="Semana"/>
        <PBtn id="historial" lbl="Historial"/>
        <PBtn id="habitos" lbl="Hábitos"/>
      </div>

      {/* HOY */}
      {period==='hoy'&&(
        <>
          {/* Tarjeta principal de progreso */}
          <div style={{...card,padding:'22px 20px',background:`linear-gradient(135deg,${T.isDark?'rgba(99,102,241,.18)':'rgba(99,102,241,.1)'},${T.isDark?'rgba(139,92,246,.1)':'rgba(168,85,247,.06))'}`}}>
            <div style={{display:'flex',alignItems:'center',gap:20}}>
              <div style={{position:'relative',display:'inline-flex',flexShrink:0}}>
                <Ring pct={mounted?pct:0} size={100} stroke={9} color={done===total&&total>0?'#22c55e':'#6366f1'}/>
                <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                  <span style={{color:T.text,fontSize:18,fontWeight:900,lineHeight:1}}>{mounted?<Counter to={pct} suffix="%"/>:'0%'}</span>
                  <span style={{color:T.textDim,fontSize:10,marginTop:2}}>hoy</span>
                </div>
              </div>
              <div style={{flex:1}}>
                <p style={{color:T.text,fontSize:28,fontWeight:900,lineHeight:1}}>{mounted?<Counter to={done}/>:'0'}<span style={{color:T.textDim,fontSize:16,fontWeight:500}}>/{total}</span></p>
                <p style={{color:T.textDim,fontSize:13,marginTop:4}}>hábitos completados</p>
                {done===total&&total>0&&<p style={{color:'#22c55e',fontSize:13,fontWeight:700,marginTop:6,animation:'pop .4s ease'}}>¡Día perfecto! 🎉</p>}
                <div style={{marginTop:12,height:5,background:T.chipInactive,borderRadius:99,overflow:'hidden'}}>
                  <div style={{height:'100%',width:mounted?`${pct}%`:'0%',background:done===total&&total>0?'linear-gradient(90deg,#22c55e,#16a34a)':'linear-gradient(90deg,#6366f1,#a855f7)',borderRadius:99,transition:'width 1.2s cubic-bezier(.4,0,.2,1)'}}/>
                </div>
              </div>
            </div>
          </div>

          {/* 4 métricas */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            {[
              {l:'Total hábitos',v:total,     ic:'📋',c:'#6366f1', sub:'activos'},
              {l:'Completados', v:done,       ic:'✅',c:'#22c55e', sub:'hoy'},
              {l:'Pendientes',  v:total-done, ic:'⏳',c:'#f97316', sub:'por hacer'},
              {l:'Mejor racha', v:maxStreak,  ic:'🔥',c:'#ec4899', sub:'días seguidos'},
            ].map(s=>(
              <div key={s.l} style={{...card,padding:'16px',marginBottom:0,background:`linear-gradient(135deg,${s.c}18,${s.c}08)`,border:`1px solid ${s.c}22`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <span style={{fontSize:24}}>{s.ic}</span>
                  <span style={{fontSize:11,color:s.c,fontWeight:700,background:`${s.c}18`,padding:'2px 8px',borderRadius:99}}>{s.sub}</span>
                </div>
                <p style={{color:T.text,fontSize:26,fontWeight:900,marginTop:10,lineHeight:1}}>{mounted?<Counter to={s.v}/>:'0'}</p>
                <p style={{color:T.textDim,fontSize:11,marginTop:4,fontWeight:500}}>{s.l}</p>
              </div>
            ))}
          </div>

          {/* Racha y mejor día */}
          {maxStreak>0&&(
            <div style={{...card,padding:'16px 18px',background:'linear-gradient(135deg,rgba(249,115,22,.14),rgba(234,179,8,.08))',border:'1px solid rgba(249,115,22,.2)',marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:32,animation:'flicker .8s ease-in-out infinite'}}>🔥</span>
                  <div>
                    <p style={{color:T.textDim,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.09em'}}>Mejor racha activa</p>
                    <p style={{color:T.text,fontSize:22,fontWeight:900,marginTop:2}}>{maxStreak} días</p>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{color:T.textDim,fontSize:10,fontWeight:600}}>Próximo hito</p>
                  <p style={{color:'#f97316',fontSize:14,fontWeight:800,marginTop:2}}>
                    {maxStreak<3?`${3-maxStreak} para 🔥x3`:maxStreak<7?`${7-maxStreak} para ⚡`:maxStreak<30?`${30-maxStreak} para 💎`:'¡Maestro! 💎'}
                  </p>
                </div>
              </div>
              <div style={{marginTop:12,height:4,background:'rgba(249,115,22,.2)',borderRadius:99,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.min((maxStreak/(maxStreak<3?3:maxStreak<7?7:30))*100,100)}%`,background:'linear-gradient(90deg,#f97316,#eab308)',borderRadius:99,transition:'width 1s ease'}}/>
              </div>
            </div>
          )}

          {bestDow&&(
            <div style={{...card,padding:'16px 18px',display:'flex',alignItems:'center',gap:14,marginBottom:12,background:`linear-gradient(135deg,${T.isDark?'rgba(99,102,241,.1)':'rgba(99,102,241,.06)'},transparent)`}}>
              <div style={{width:46,height:46,borderRadius:14,background:'rgba(99,102,241,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>📅</div>
              <div>
                <p style={{color:T.textDim,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em'}}>Mejor día de la semana</p>
                <p style={{color:T.text,fontSize:18,fontWeight:800,marginTop:3}}>{bestDow.day}</p>
                <p style={{color:T.textDim,fontSize:12,marginTop:2}}>{bestDow.count} hábitos completados en total</p>
              </div>
            </div>
          )}

          {/* AI Insight */}
          <div style={{...card,padding:'18px',background:`linear-gradient(135deg,rgba(99,102,241,.12),rgba(168,85,247,.07))`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:aiInsight?12:0}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:20}}>🤖</span>
                <span style={{color:T.text,fontSize:14,fontWeight:700}}>Insight IA</span>
              </div>
              {!aiInsight&&!aiLoading&&(
                <button onClick={loadInsight} style={{padding:'7px 14px',borderRadius:99,border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:12,fontWeight:600,cursor:'pointer',boxShadow:'0 3px 12px rgba(99,102,241,.35)'}}>Analizar</button>
              )}
            </div>
            {aiLoading&&<div style={{display:'flex',alignItems:'center',gap:10,marginTop:10}}><span style={{fontSize:20,animation:'flicker .8s ease-in-out infinite'}}>🤖</span><p style={{color:T.textDim,fontSize:13}}>Analizando tu progreso…</p></div>}
            {aiInsight&&<p style={{color:T.text,fontSize:13,lineHeight:1.7,fontStyle:'italic',marginTop:4}}>"{aiInsight}"</p>}
            {!aiInsight&&!aiLoading&&<p style={{color:T.textDim,fontSize:12,marginTop:6,lineHeight:1.5}}>Obtén un análisis personalizado de tus hábitos con IA.</p>}
          </div>
        </>
      )}

      {/* SEMANA — bar chart mejorado */}
      {period==='semana'&&(
        <>
          <p style={{color:T.textDim,fontSize:12,marginBottom:14,fontWeight:500}}>Completaciones diarias · últimos 7 días</p>
          <div style={{...card,padding:'20px 16px'}}>
            <div style={{display:'flex',alignItems:'flex-end',gap:6,height:140,marginBottom:14}}>
              {last7.map((d,i)=>{
                const count   = dayCount[d]||0;
                const maxH    = Math.max(...last7.map(dd=>dayCount[dd]||0),1);
                const h       = Math.round((count/maxH)*100);
                const isToday = d===todayStr();
                const colors  = ['#6366f1','#8b5cf6','#a855f7','#ec4899','#f97316','#eab308','#22c55e'];
                const barColor = isToday
                  ? 'linear-gradient(180deg,#818cf8,#6366f1)'
                  : count>0
                    ? `linear-gradient(180deg,${colors[i]}cc,${colors[i]}88)`
                    : T.chipInactive;
                return (
                  <div key={d} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:5,height:'100%',justifyContent:'flex-end'}}>
                    <span style={{color:isToday?'#a5b4fc':count>0?T.textDim:T.textFaint,fontSize:11,fontWeight:700,minHeight:16}}>{count>0?count:''}</span>
                    <div style={{
                      width:'100%',borderRadius:'8px 8px 4px 4px',
                      transition:'height .9s cubic-bezier(.34,1.56,.64,1)',
                      transitionDelay:`${i*70}ms`,
                      height:mounted?`${Math.max(h,5)}%`:'5%',
                      background:barColor,
                      boxShadow:isToday?'0 4px 14px rgba(99,102,241,.4)':count>0?`0 2px 8px ${colors[i]}33`:'none',
                      border:isToday?'none':count>0?'none':`1px solid ${T.cardBorder}`,
                      position:'relative',overflow:'hidden',
                    }}>
                      {isToday&&<div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(255,255,255,.15),transparent)'}}/>}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
                      <span style={{color:isToday?T.accent:T.textFaint,fontSize:10,fontWeight:isToday?800:400}}>{DAYS[dowOf(d)]}</span>
                      {isToday&&<div style={{width:4,height:4,borderRadius:'50%',background:T.accent}}/>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,borderTop:`1px solid ${T.cardBorder}`}}>
              <span style={{color:T.textDim,fontSize:11}}>Total 7 días: <strong style={{color:T.text}}>{last7.reduce((s,d)=>s+(dayCount[d]||0),0)}</strong></span>
              <span style={{color:T.textDim,fontSize:11}}>Promedio: <strong style={{color:T.text}}>{(last7.reduce((s,d)=>s+(dayCount[d]||0),0)/7).toFixed(1)}/día</strong></span>
            </div>
          </div>

          {/* Racha */}
          <div style={{...card,padding:'18px',background:'linear-gradient(135deg,rgba(249,115,22,.14),rgba(234,179,8,.08))',border:'1px solid rgba(249,115,22,.2)'}}>
            <p style={{color:T.textDim,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.09em',marginBottom:12}}>Racha semanal</p>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:30,animation:'flicker .8s ease-in-out infinite'}}>🔥</span>
                <div>
                  <span style={{color:T.text,fontSize:30,fontWeight:900,lineHeight:1}}>{maxStreak}</span>
                  <span style={{color:T.textDim,fontSize:14,marginLeft:5}}>días</span>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{color:T.textDim,fontSize:11}}>Próximo hito</p>
                <p style={{color:'#f97316',fontSize:15,fontWeight:800}}>
                  {maxStreak<3?`🔥 ${3-maxStreak} días más`:maxStreak<7?`⚡ ${7-maxStreak} días más`:maxStreak<30?`💎 ${30-maxStreak} días más`:'¡Leyenda! 💎'}
                </p>
              </div>
            </div>
            <div style={{display:'flex',gap:6}}>
              {DAYS.map((d,i)=>{
                const active=i<=todayDow;
                return (
                  <div key={d} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <div style={{width:'100%',aspectRatio:'1',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,background:active?(i===todayDow?'linear-gradient(135deg,#f97316,#eab308)':'rgba(249,115,22,.25)'):T.chipInactive,color:active?'#fff':T.textFaint,boxShadow:i===todayDow?'0 3px 10px rgba(249,115,22,.4)':'none',transition:`all .3s`,transitionDelay:`${i*40}ms`}}>{d}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* HISTORIAL — 30-day GitHub grid */}
      {period==='historial'&&(
        <>
          <p style={{color:T.textDim,fontSize:12,marginBottom:14}}>Últimos 30 días · cuadros = hábitos completados ese día</p>
          {habits.length===0?(
            <div style={{textAlign:'center',marginTop:40,opacity:.4}}><div style={{fontSize:40}}>📅</div><p style={{color:T.textDim,marginTop:10,fontSize:14}}>Sin hábitos aún</p></div>
          ):(
            <div style={{...card,padding:'18px 16px'}}>
              {/* Day labels */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:4,marginBottom:4}}>
                {[...Array(10)].map((_,i)=><div key={i} style={{textAlign:'center',fontSize:9,color:T.textFaint}}>{DAYS[dowOf(last30[i*3]||last30[0])]}</div>)}
              </div>
              {/* Grid */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:4}}>
                {last30.map((d,i)=>{
                  const count = dayCount[d]||0;
                  const maxP  = Math.max(...Object.values(dayCount),1);
                  const intensity = count===0?0:Math.max(0.15,count/maxP);
                  const isToday = d===todayStr();
                  return (
                    <div key={d} title={`${d}: ${count} hábitos`} style={{
                      aspectRatio:'1',borderRadius:6,
                      background:count>0?`rgba(99,102,241,${intensity})`:T.calFill,
                      border:isToday?'2px solid #6366f1':`1px solid ${T.cardBorder}`,
                      transition:`background .3s`,transitionDelay:`${i*15}ms`,
                      cursor:'default',
                    }}/>
                  );
                })}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:12,justifyContent:'flex-end'}}>
                <span style={{color:T.textFaint,fontSize:11}}>Menos</span>
                {[0,.25,.5,.75,1].map(o=><div key={o} style={{width:12,height:12,borderRadius:3,background:o===0?T.calFill:`rgba(99,102,241,${o})`}}/>)}
                <span style={{color:T.textFaint,fontSize:11}}>Más</span>
              </div>
            </div>
          )}

          {/* Per-habit mini grids */}
          {habits.length>0&&(
            <>
              <p style={{color:T.sectionLabel||T.textDim,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10,marginTop:16}}>Por hábito</p>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {habits.map(h=>(
                  <div key={h.id} style={{...card,padding:'14px 16px',marginBottom:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                      <span style={{fontSize:18}}>{h.icon}</span>
                      <span style={{color:T.text,fontSize:13,fontWeight:600}}>{h.name}</span>
                      <span style={{color:T.textDim,fontSize:11,marginLeft:'auto'}}>🔥{h.streak||0}d</span>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:3}}>
                      {last30.map((d,i)=>{
                        const filled = h.history&&h.history[d];
                        return <div key={d} style={{aspectRatio:'1',borderRadius:4,background:filled?h.color+'99':T.calFill,border:`1px solid ${T.cardBorder}`,transition:`background .3s`,transitionDelay:`${i*10}ms`}}/>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* HÁBITOS — expandable categories */}
      {period==='habitos'&&(
        <>
          <p style={{color:T.textDim,fontSize:12,marginBottom:14}}>Toca una categoría para ver el detalle</p>
          {catStats.length===0&&<div style={{textAlign:'center',marginTop:40,opacity:.4}}><div style={{fontSize:40}}>📂</div><p style={{color:T.textDim,marginTop:10,fontSize:14}}>Sin categorías</p></div>}
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {catStats.map(c=>{
              const p=c.total===0?0:Math.round(c.done/c.total*100);
              const open=expCat===c.label;
              return (
                <div key={c.label} style={{...card,overflow:'hidden',marginBottom:0}}>
                  <div onClick={()=>setExpCat(open?null:c.label)} style={{padding:'14px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:38,height:38,borderRadius:12,background:T.chipInactive,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{CAT_IC[c.label]}</div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                        <span style={{color:T.text,fontSize:14,fontWeight:700}}>{c.label}</span>
                        <span style={{color:T.textDim,fontSize:13}}>{c.done}/{c.total}</span>
                      </div>
                      <div style={{height:4,background:T.chipInactive,borderRadius:99,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${mounted?p:0}%`,background:'linear-gradient(90deg,#6366f1,#a855f7)',borderRadius:99,transition:'width .8s ease'}}/>
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textFaint} strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,transform:open?'rotate(180deg)':'rotate(0deg)',transition:'transform .25s'}}><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                  {open&&(
                    <div style={{borderTop:`1px solid ${T.cardBorder}`,padding:'10px 14px 14px',display:'flex',flexDirection:'column',gap:8}}>
                      {c.habits.map(h=>(
                        <div key={h.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:T.chipInactive,borderRadius:14}}>
                          <span style={{fontSize:18}}>{h.icon}</span>
                          <span style={{flex:1,color:h.done?T.textDim:T.text,fontSize:13,fontWeight:500,textDecoration:h.done?'line-through':'none'}}>{h.name}</span>
                          {(h.streak||0)>0&&<span style={{fontSize:11,color:'#f97316',fontWeight:600}}>🔥{h.streak}d</span>}
                          <div style={{width:22,height:22,borderRadius:'50%',background:h.done?h.color:'transparent',border:`2px solid ${h.done?h.color:T.textFaint}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            {h.done&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Badge detail sheet ───────────────────────────────────────
function BadgeSheet({ a, unlocked, habits, meta, onClose }) {
  const T = useT();
  const prog = (()=>{
    if(a.id==='first')    return {cur:Math.min(habits.length,1),max:1};
    if(a.id==='five')     return {cur:Math.min(habits.length,5),max:5};
    if(a.id==='variety')  return {cur:Math.min(new Set(habits.map(h=>h.category)).size,3),max:3};
    if(a.id==='streak3')  return {cur:Math.min(habits.reduce((m,h)=>Math.max(m,h.streak||0),0),3),max:3};
    if(a.id==='streak7')  return {cur:Math.min(habits.reduce((m,h)=>Math.max(m,h.streak||0),0),7),max:7};
    if(a.id==='streak30') return {cur:Math.min(habits.reduce((m,h)=>Math.max(m,h.streak||0),0),30),max:30};
    if(a.id==='allday')   return {cur:meta.hadPerfectDay?1:0,max:1};
    if(a.id==='counter')  return {cur:habits.filter(h=>h.type==='counter').length>0?1:0,max:1};
    if(a.id==='timer')    return {cur:habits.filter(h=>h.type==='timer').length>0?1:0,max:1};
    return null;
  })();
  const pct = prog?Math.round(prog.cur/prog.max*100):(unlocked?100:0);
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet" style={{background:T.sheetBg,textAlign:'center'}}>
        <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
        <div style={{width:80,height:80,borderRadius:24,margin:'0 auto 16px',background:unlocked?`${a.color}25`:T.chipInactive,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,filter:unlocked?'none':'grayscale(1)',boxShadow:unlocked?`0 0 40px ${a.color}40`:'none'}}>
          {a.icon}
        </div>
        <p style={{color:T.text,fontSize:20,fontWeight:800,marginBottom:6}}>{a.label}</p>
        <p style={{color:T.textDim,fontSize:14,marginBottom:20,lineHeight:1.5}}>{a.desc}</p>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:99,marginBottom:22,background:unlocked?`${a.color}22`:T.chipInactive,border:`1px solid ${unlocked?a.color+'44':T.cardBorder}`}}>
          <span style={{fontSize:13}}>{unlocked?'✓':'🔒'}</span>
          <span style={{color:unlocked?a.color:T.textDim,fontSize:13,fontWeight:600}}>{unlocked?'Desbloqueado':'Bloqueado'}</span>
        </div>
        {prog&&(
          <div style={{marginBottom:22}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{color:T.textDim,fontSize:12}}>Progreso</span>
              <span style={{color:T.text,fontSize:12,fontWeight:600}}>{prog.cur}/{prog.max}</span>
            </div>
            <div style={{height:5,background:T.chipInactive,borderRadius:99,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${a.color},${a.color}99)`,borderRadius:99,transition:'width 1s ease'}}/>
            </div>
          </div>
        )}
        {!unlocked&&prog&&prog.cur<prog.max&&(
          <p style={{color:T.textDim,fontSize:13,marginBottom:20,lineHeight:1.5}}>
            Faltan <strong style={{color:T.text}}>{prog.max-prog.cur}</strong> {a.id.includes('streak')?'días de racha':a.id==='five'||a.id==='variety'?'más':' para completar'}.
          </p>
        )}
        <button onClick={onClose} style={{background:T.chipInactive,color:T.textDim,border:`1px solid ${T.cardBorder}`,borderRadius:16,padding:'12px 28px',fontFamily:'Inter,sans-serif',fontSize:15,cursor:'pointer'}}>Cerrar</button>
      </div>
    </div>
  );
}

// ─── Logros Screen ────────────────────────────────────────────
function LogrosScreen({ habits, meta }) {
  const T = useT();
  const [sel, setSel] = uS(null);
  const unlocked = ACHIEVEMENTS.filter(a=>a.check(habits,meta));
  const locked   = ACHIEVEMENTS.filter(a=>!a.check(habits,meta));
  const pct = Math.round(unlocked.length/ACHIEVEMENTS.length*100);

  const Card = ({ a }) => {
    const isU = unlocked.includes(a);
    return (
      <div onClick={()=>setSel(a)} style={{display:'flex',alignItems:'center',gap:12,padding:'16px',borderRadius:20,cursor:'pointer',background:isU?`linear-gradient(135deg,${a.color}18,${a.color}08)`:T.chipInactive,border:`1px solid ${isU?a.color+'30':T.cardBorder}`,opacity:isU?1:.45,transition:'transform .18s',marginBottom:0}}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        <div style={{width:52,height:52,borderRadius:16,background:isU?`${a.color}22`:T.chipInactive,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0,filter:isU?'none':'grayscale(1)'}}>{a.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{color:T.text,fontSize:14,fontWeight:700}}>{a.label}</p>
          <p style={{color:T.textDim,fontSize:12,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.desc}</p>
        </div>
        <div style={{flexShrink:0}}>{isU?<div style={{background:`${a.color}25`,borderRadius:12,padding:'5px 10px'}}><span style={{color:a.color,fontSize:12,fontWeight:700}}>✓</span></div>:<span style={{fontSize:18}}>🔒</span>}</div>
      </div>
    );
  };

  return (
    <div style={{flex:1,overflowY:'auto',padding:'18px 16px 100px',position:'relative'}}>
      <p style={{color:T.text,fontSize:22,fontWeight:800,marginBottom:4}}>Logros 🏆</p>
      <p style={{color:T.textDim,fontSize:13,marginBottom:18}}>Toca un logro para ver tu progreso</p>

      <div style={{background:`linear-gradient(135deg,rgba(99,102,241,.12),rgba(236,72,153,.07))`,border:`1px solid ${T.cardBorder}`,borderRadius:22,padding:'18px 20px',marginBottom:20,display:'flex',alignItems:'center',gap:16}}>
        <div style={{position:'relative',display:'inline-flex',flexShrink:0}}>
          <Ring pct={pct} size={72} stroke={7} color="#ec4899"/>
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:T.text,fontSize:14,fontWeight:800}}>{pct}%</span>
          </div>
        </div>
        <div>
          <p style={{color:T.text,fontSize:20,fontWeight:800}}>{unlocked.length}/{ACHIEVEMENTS.length}</p>
          <p style={{color:T.textDim,fontSize:13,marginTop:2}}>logros desbloqueados</p>
          <div style={{display:'flex',gap:4,marginTop:8,flexWrap:'wrap'}}>
            {ACHIEVEMENTS.map(a=>(
              <div key={a.id} onClick={()=>setSel(a)} style={{width:26,height:26,borderRadius:8,background:unlocked.includes(a)?a.color+'99':T.chipInactive,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,cursor:'pointer',transition:'background .3s'}}>{unlocked.includes(a)?a.icon:''}</div>
            ))}
          </div>
        </div>
      </div>

      {unlocked.length>0&&(
        <>
          <p style={{color:T.textDim,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Desbloqueados ✨</p>
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
            {unlocked.map(a=><Card key={a.id} a={a}/>)}
          </div>
        </>
      )}
      {locked.length>0&&(
        <>
          <p style={{color:T.textDim,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Por desbloquear</p>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {locked.map(a=><Card key={a.id} a={a}/>)}
          </div>
        </>
      )}

      {sel&&<BadgeSheet a={sel} unlocked={unlocked.includes(sel)} habits={habits} meta={meta} onClose={()=>setSel(null)}/>}
    </div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────
function SettingsScreen({ meta, onMetaChange, habits, onClear }) {
  const T = useT();
  const [confirmClear, setConfirmClear] = uS(false);
  const [confirmReset, setConfirmReset] = uS(false);
  const [notifPrefs, setNotifPrefs]     = uS(()=>loadNotifPrefs());
  const [permission, setPermission]     = uS(()=>getNotifPermission());

  const savePrefs = (updated) => {
    setNotifPrefs(updated);
    saveNotifPrefs(updated);
    scheduleNotifications(habits, updated);
  };

  const handleEnableNotifs = async () => {
    const result = await requestNotifPermission();
    setPermission(result);
    if (result === 'granted') {
      const updated = { ...notifPrefs, enabled: true };
      savePrefs(updated);
    }
  };

  const card = (extra={}) => ({
    background:T.card, border:`1px solid ${T.cardBorder}`,
    borderRadius:20, padding:'16px 18px', marginBottom:12, ...extra
  });

  const Row = ({ icon, label, right, onClick, danger }) => (
    <div onClick={onClick} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 0',
      borderBottom:`1px solid ${T.cardBorder}`,cursor:onClick?'pointer':'default'}}
      onMouseEnter={e=>onClick&&(e.currentTarget.style.opacity='.7')}
      onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
      <span style={{fontSize:22,width:32,textAlign:'center'}}>{icon}</span>
      <span style={{flex:1,color:danger?'#f87171':T.text,fontSize:14,fontWeight:500}}>{label}</span>
      {right}
    </div>
  );

  const Toggle = ({ val, onChange, disabled }) => (
    <div onClick={!disabled?onChange:undefined} style={{
      width:48,height:28,borderRadius:99,flexShrink:0,
      background:val?T.accent:'rgba(120,120,130,.3)',
      cursor:disabled?'not-allowed':'pointer',
      position:'relative',transition:'background .2s',opacity:disabled?.5:1,
    }}>
      <div style={{position:'absolute',top:3,left:val?22:3,width:22,height:22,borderRadius:'50%',
        background:'#fff',transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,.25)'}}/>
    </div>
  );

  const TimeInput = ({ val, onChange }) => (
    <input type="time" value={val} onChange={e=>onChange(e.target.value)}
      style={{padding:'7px 10px',borderRadius:10,border:`1.5px solid ${T.inputBorder}`,
        background:T.inputBg,color:T.text,fontFamily:'Inter,sans-serif',fontSize:13,outline:'none'}}/>
  );

  const PROFILE_EMOJIS = ['😊','🧑','👩','🦸','🧙','🤖','🦊','🐼','🌟','🔥','💎','🎯'];

  // Permission status badge
  const permBadge = () => {
    if (permission === 'unsupported') return { label:'No soportado', color:'#6b7280' };
    if (permission === 'denied')      return { label:'Bloqueado ⚠️', color:'#ef4444' };
    if (permission === 'granted')     return { label:'Activo ✓',     color:'#22c55e' };
    return { label:'Sin activar',     color:'#f97316' };
  };
  const pb = permBadge();

  return (
    <div style={{flex:1,overflowY:'auto',padding:'18px 16px 100px'}}>
      <p style={{color:T.text,fontSize:22,fontWeight:800,marginBottom:18}}>Ajustes ⚙️</p>

      {/* ── Profile ── */}
      <p style={{color:T.textDim,fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Perfil</p>

      {/* Preview card */}
      <div style={{...card({padding:'18px',marginBottom:10}),background:T.isDark?'linear-gradient(135deg,rgba(99,102,241,.18),rgba(139,92,246,.1))':'linear-gradient(135deg,rgba(99,102,241,.1),rgba(168,85,247,.06))'}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:62,height:62,borderRadius:20,flexShrink:0,background:T.accentGrad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,boxShadow:'0 6px 20px rgba(99,102,241,.3)'}}>
            {meta.profile?.emoji||'😊'}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{color:T.text,fontSize:18,fontWeight:800,lineHeight:1.1}}>{meta.profile?.name||'Tu nombre'}</p>
            <p style={{color:T.textDim,fontSize:12,marginTop:4,fontStyle:'italic',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>"{meta.profile?.motivation||'Pequeños pasos, grandes cambios.'}"</p>
            {meta.profile?.dailyGoal>0&&<div style={{display:'inline-flex',alignItems:'center',gap:5,marginTop:6,padding:'3px 10px',borderRadius:99,background:T.accentDim,border:`1px solid ${T.accentBorder}`}}><span style={{fontSize:11}}>🎯</span><span style={{color:T.accentText,fontSize:11,fontWeight:700}}>Meta: {meta.profile.dailyGoal} hábitos/día</span></div>}
          </div>
        </div>
      </div>

      <div style={card({padding:'16px'})}>
        <p style={{color:T.textDim,fontSize:11,fontWeight:600,marginBottom:10}}>Avatar</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
          {PROFILE_EMOJIS.map(e=>(
            <button key={e} onClick={()=>onMetaChange({...meta,profile:{...meta.profile,emoji:e}})}
              style={{width:42,height:42,borderRadius:13,border:`2px solid ${meta.profile?.emoji===e?T.accent:T.cardBorder}`,background:meta.profile?.emoji===e?T.accentDim:T.chipInactive,cursor:'pointer',fontSize:24,transition:'all .15s',boxShadow:meta.profile?.emoji===e?'0 2px 10px rgba(99,102,241,.3)':'none'}}>{e}</button>
          ))}
        </div>

        <p style={{color:T.textDim,fontSize:11,fontWeight:600,marginBottom:8}}>Nombre</p>
        <input value={meta.profile?.name||''} onChange={e=>onMetaChange({...meta,profile:{...meta.profile,name:e.target.value}})} placeholder="¿Cómo te llamas?"
          style={{background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,borderRadius:12,padding:'11px 13px',color:T.text,fontFamily:'Inter,sans-serif',fontSize:14,width:'100%',outline:'none',marginBottom:14}}/>

        <p style={{color:T.textDim,fontSize:11,fontWeight:600,marginBottom:8}}>Frase motivacional</p>
        <input value={meta.profile?.motivation||''} onChange={e=>onMetaChange({...meta,profile:{...meta.profile,motivation:e.target.value}})} placeholder="Tu frase personal…"
          style={{background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,borderRadius:12,padding:'11px 13px',color:T.text,fontFamily:'Inter,sans-serif',fontSize:14,width:'100%',outline:'none',marginBottom:14}}/>

        <p style={{color:T.textDim,fontSize:11,fontWeight:600,marginBottom:8}}>Meta diaria de hábitos</p>
        <div style={{display:'flex',gap:8}}>
          {[1,2,3,4,5,6,7,8].map(n=>(
            <button key={n} onClick={()=>onMetaChange({...meta,profile:{...meta.profile,dailyGoal:n}})}
              style={{flex:1,padding:'9px 0',borderRadius:12,border:`2px solid ${meta.profile?.dailyGoal===n?T.accent:T.cardBorder}`,background:meta.profile?.dailyGoal===n?T.accentDim:T.chipInactive,color:meta.profile?.dailyGoal===n?T.accentText:T.textDim,fontFamily:'Inter,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all .15s'}}>{n}</button>
          ))}
        </div>
      </div>

      {/* ── Apariencia: Dark/Light ── */}
      <p style={{color:T.textDim,fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Apariencia</p>
      <div style={card({padding:'4px 18px'})}>
        <Row icon={meta.lightMode?'☀️':'🌙'} label={meta.lightMode?'Modo claro activo':'Modo oscuro activo'}
          right={<Toggle val={meta.lightMode} onChange={()=>onMetaChange({...meta,lightMode:!meta.lightMode})}/>}/>
      </div>

      {/* ── Color palettes ── */}
      <p style={{color:T.textDim,fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Color de acento</p>
      <div style={card({padding:'18px'})}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
          {ACCENTS.map(a => {
            const sel = (meta.accent||'indigo') === a.id;
            return (
              <button key={a.id} onClick={()=>onMetaChange({...meta,accent:a.id})}
                style={{
                  display:'flex',flexDirection:'column',alignItems:'center',gap:6,
                  padding:'10px 4px',borderRadius:14,cursor:'pointer',
                  border:`2px solid ${sel?a.primary:T.cardBorder}`,
                  background:sel?`linear-gradient(135deg,${a.primary}22,${a.secondary}11)`:T.chipInactive,
                  transition:'all .18s',
                }}>
                <div style={{width:32,height:32,borderRadius:'50%',
                  background:`linear-gradient(135deg,${a.primary},${a.secondary})`,
                  boxShadow:sel?`0 0 0 3px ${a.primary}44`:'none',
                  transition:'box-shadow .2s',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
                  {sel?'✓':''}
                </div>
                <span style={{color:sel?a.primary:T.textDim,fontSize:11,fontWeight:700}}>{a.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preview strip */}
        <div style={{marginTop:14,padding:'12px 14px',borderRadius:14,
          background:T.accentDim,border:`1px solid ${T.accentBorder}`,
          display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:T.accentGrad,
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <div style={{flex:1}}>
            <p style={{color:T.text,fontSize:13,fontWeight:600}}>Vista previa del acento</p>
            <div style={{height:4,background:T.chipInactive,borderRadius:99,overflow:'hidden',marginTop:6}}>
              <div style={{height:'100%',width:'65%',background:T.accentGrad,borderRadius:99}}/>
            </div>
          </div>
          <span style={{color:T.accentText,fontSize:12,fontWeight:700}}>65%</span>
        </div>
      </div>

      {/* ── Notifications ── */}
      <p style={{color:T.textDim,fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Notificaciones</p>
      <div style={card({padding:'18px'})}>
        {/* Status + enable */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <p style={{color:T.text,fontSize:14,fontWeight:600}}>Recordatorios</p>
            <p style={{marginTop:3}}>
              <span style={{fontSize:12,fontWeight:600,color:pb.color,background:pb.color+'18',
                padding:'2px 8px',borderRadius:99}}>{pb.label}</span>
            </p>
          </div>
          {permission!=='granted'?(
            <button onClick={handleEnableNotifs} disabled={permission==='unsupported'||permission==='denied'}
              style={{padding:'9px 16px',borderRadius:12,border:'none',
                background:permission==='denied'||permission==='unsupported'?T.chipInactive:T.accentGrad,
                color:permission==='denied'||permission==='unsupported'?T.textDim:'#fff',
                fontFamily:'Inter,sans-serif',fontSize:13,fontWeight:600,cursor:permission==='denied'?'not-allowed':'pointer'}}>
              {permission==='denied'?'Bloqueado':permission==='unsupported'?'No disponible':'Activar'}
            </button>
          ):(
            <Toggle val={notifPrefs.enabled} onChange={()=>savePrefs({...notifPrefs,enabled:!notifPrefs.enabled})}/>
          )}
        </div>

        {permission==='denied'&&(
          <p style={{color:'#f87171',fontSize:12,lineHeight:1.5,marginBottom:14,padding:'10px 12px',
            borderRadius:10,background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)'}}>
            Bloqueaste las notificaciones. Ve a Ajustes del navegador → Permisos del sitio para reactivarlas.
          </p>
        )}

        {permission==='granted'&&notifPrefs.enabled&&(
          <div style={{display:'flex',flexDirection:'column',gap:0,borderTop:`1px solid ${T.cardBorder}`,paddingTop:12}}>
            {/* Morning */}
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${T.cardBorder}`}}>
              <span style={{fontSize:20,width:28,textAlign:'center'}}>☀️</span>
              <span style={{flex:1,color:T.text,fontSize:13,fontWeight:500}}>Recordatorio mañana</span>
              <TimeInput val={notifPrefs.morningTime} onChange={v=>savePrefs({...notifPrefs,morningTime:v})}/>
              <Toggle val={notifPrefs.morning} onChange={()=>savePrefs({...notifPrefs,morning:!notifPrefs.morning})}/>
            </div>
            {/* Evening */}
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${T.cardBorder}`}}>
              <span style={{fontSize:20,width:28,textAlign:'center'}}>🌙</span>
              <span style={{flex:1,color:T.text,fontSize:13,fontWeight:500}}>Recordatorio noche</span>
              <TimeInput val={notifPrefs.eveningTime} onChange={v=>savePrefs({...notifPrefs,eveningTime:v})}/>
              <Toggle val={notifPrefs.evening} onChange={()=>savePrefs({...notifPrefs,evening:!notifPrefs.evening})}/>
            </div>
            {/* Habit reminders */}
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${T.cardBorder}`}}>
              <span style={{fontSize:20,width:28,textAlign:'center'}}>⏰</span>
              <div style={{flex:1}}>
                <p style={{color:T.text,fontSize:13,fontWeight:500}}>Antes de cada hábito</p>
                <p style={{color:T.textDim,fontSize:11,marginTop:2}}>Hábitos con hora programada</p>
              </div>
              <select value={notifPrefs.reminderOffset}
                onChange={e=>savePrefs({...notifPrefs,reminderOffset:Number(e.target.value)})}
                style={{padding:'6px 8px',borderRadius:10,border:`1px solid ${T.inputBorder}`,
                  background:T.inputBg,color:T.text,fontFamily:'Inter,sans-serif',fontSize:12,outline:'none',marginRight:8}}>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
              </select>
              <Toggle val={notifPrefs.habitReminders} onChange={()=>savePrefs({...notifPrefs,habitReminders:!notifPrefs.habitReminders})}/>
            </div>
            {/* Test notification */}
            <button onClick={()=>fireNotification('¡Prueba! 🎯','Las notificaciones funcionan correctamente.','🎯')}
              style={{marginTop:12,padding:'10px',borderRadius:12,border:`1px solid ${T.accentBorder}`,
                background:T.accentDim,color:T.accentText,fontFamily:'Inter,sans-serif',
                fontSize:13,fontWeight:600,cursor:'pointer',width:'100%'}}>
              Enviar notificación de prueba 🔔
            </button>
          </div>
        )}
      </div>

      {/* ── Stats summary ── */}
      <p style={{color:T.textDim,fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Resumen</p>
      <div style={card({padding:'4px 18px'})}>
        {[
          {icon:'📋',label:'Hábitos totales',val:habits.length},
          {icon:'🔥',label:'Mejor racha',val:`${habits.reduce((m,h)=>Math.max(m,h.streak||0),0)} días`},
          {icon:'✅',label:'Completados hoy',val:habits.filter(h=>h.done).length},
          {icon:'🏆',label:'Logros',val:`${ACHIEVEMENTS.filter(a=>a.check(habits,meta)).length}/${ACHIEVEMENTS.length}`},
        ].map((r,i,arr)=>(
          <div key={r.label} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 0',
            borderBottom:i<arr.length-1?`1px solid ${T.cardBorder}`:'none'}}>
            <span style={{fontSize:22,width:32,textAlign:'center'}}>{r.icon}</span>
            <span style={{flex:1,color:T.text,fontSize:14,fontWeight:500}}>{r.label}</span>
            <span style={{color:T.textDim,fontSize:14,fontWeight:600}}>{r.val}</span>
          </div>
        ))}
      </div>

      {/* ── Danger zone ── */}
      <p style={{color:T.textDim,fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Datos</p>
      <div style={card({padding:'4px 18px'})}>
        <Row icon="🗑" label="Borrar todos los hábitos" danger onClick={()=>setConfirmClear(true)}
          right={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textFaint} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>}/>
        <Row icon="🔄" label="Reiniciar app completamente" danger onClick={()=>setConfirmReset(true)}
          right={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textFaint} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>}/>
      </div>

      {confirmClear&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setConfirmClear(false)}>
          <div className="sheet" style={{background:T.sheetBg,textAlign:'center'}}>
            <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
            <span style={{fontSize:44}}>⚠️</span>
            <p style={{color:T.text,fontSize:17,fontWeight:700,marginTop:10,marginBottom:6}}>¿Borrar todos los hábitos?</p>
            <p style={{color:T.textDim,fontSize:14,marginBottom:26}}>Se eliminarán todos los hábitos y su historial. No se puede deshacer.</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setConfirmClear(false)} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer'}}>Cancelar</button>
              <button onClick={()=>{onClear();setConfirmClear(false);}} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ef4444,#f97316)',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:600,cursor:'pointer'}}>Borrar</button>
            </div>
          </div>
        </div>
      )}

      {confirmReset&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setConfirmReset(false)}>
          <div className="sheet" style={{background:T.sheetBg,textAlign:'center'}}>
            <div className="handle" style={{background:T.isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'}}/>
            <span style={{fontSize:52}}>🔄</span>
            <p style={{color:T.text,fontSize:18,fontWeight:800,marginTop:12,marginBottom:8}}>Reiniciar completamente</p>
            <p style={{color:T.textDim,fontSize:14,lineHeight:1.6,marginBottom:8}}>Se borrará <strong style={{color:'#f87171'}}>absolutamente todo</strong>:</p>
            <div style={{textAlign:'left',marginBottom:22,padding:'12px 16px',background:'rgba(239,68,68,.08)',borderRadius:14,border:'1px solid rgba(239,68,68,.18)'}}>
              {['Todos los hábitos y rachas','Tu perfil y configuración','Historial de 30 días','Agenda y tareas','Logros desbloqueados'].map(item=>(
                <p key={item} style={{color:'#f87171',fontSize:13,marginBottom:4,display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:10}}>✕</span>{item}
                </p>
              ))}
            </div>
            <p style={{color:T.textDim,fontSize:13,marginBottom:22}}>La app volverá a la pantalla de bienvenida inicial.</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setConfirmReset(false)} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${T.cardBorder}`,background:T.chipInactive,color:T.textDim,fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,cursor:'pointer'}}>Cancelar</button>
              <button onClick={()=>{
                ['mh4_habits','mh4_meta','mh4_onboarded','mh4_lastReset',
                 'mh4_myday_tasks','mh4_myday_top','mh4_agenda_tasks','mh4_notif_prefs'
                ].forEach(k=>localStorage.removeItem(k));
                Object.keys(localStorage).filter(k=>k.startsWith('mh4_')).forEach(k=>localStorage.removeItem(k));
                window.location.reload();
              }} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(239,68,68,.4)'}}>
                Reiniciar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { StatsScreen, LogrosScreen, SettingsScreen });
