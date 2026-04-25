// ─── app-myday.jsx — Mi Día completo ─────────────────────────

function MiDiaScreen({ habits }) {
  const T = useT();
  const { useState: uS, useEffect: uE, useMemo: uM } = React;

  const KEY_TASKS     = 'mh4_myday_tasks';
  const KEY_TOP       = 'mh4_myday_top';
  const KEY_INTENTION = 'mh4_myday_intention';
  const KEY_MOOD      = 'mh4_myday_mood';
  const KEY_RESULT    = 'mh4_myday_result';
  const KEY_DATE      = 'mh4_myday_date';

  const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
  const save = (k, v)  => localStorage.setItem(k, JSON.stringify(v));

  const today = new Date();
  const todayKey = todayStr();

  // Reset diario de tareas Mi Día
  const [tasks, setTasks]         = uS(() => {
    const saved = load(KEY_DATE, '');
    if (saved !== todayKey) { save(KEY_TASKS, []); save(KEY_TOP, []); save(KEY_DATE, todayKey); return []; }
    return load(KEY_TASKS, []);
  });
  const [topTasks, setTopTasks]   = uS(() => load(KEY_TOP, []));
  const [intention, setIntention] = uS(() => load(KEY_INTENTION + '_' + todayKey, ''));
  const [mood, setMood]           = uS(() => load(KEY_MOOD + '_' + todayKey, null));
  const [result, setResult]       = uS(() => load(KEY_RESULT + '_' + todayKey, null));
  const [newTask, setNewTask]      = uS('');
  const [newTop, setNewTop]        = uS('');
  const [view, setView]            = uS('morning'); // 'morning' | 'myday' | 'night'

  uE(() => save(KEY_TASKS, tasks), [tasks]);
  uE(() => save(KEY_TOP, topTasks), [topTasks]);
  uE(() => save(KEY_INTENTION + '_' + todayKey, intention), [intention]);
  uE(() => save(KEY_MOOD + '_' + todayKey, mood), [mood]);
  uE(() => save(KEY_RESULT + '_' + todayKey, result), [result]);

  const dateStr = today.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

  // Hábitos activos hoy
  const activeHabits = uM(() => {
    const dow = today.getDay();
    return (habits || []).filter(h =>
      h.frequency === 'daily' ||
      (h.frequency === 'weekdays' && dow >= 1 && dow <= 5) ||
      (h.frequency === 'weekends' && (dow === 0 || dow === 6))
    );
  }, [habits]);

  const doneHabits  = activeHabits.filter(h => h.done).length;
  const doneTasks   = tasks.filter(t => t.done).length;
  const totalTasks  = tasks.length;
  const pct = (activeHabits.length + totalTasks) === 0 ? 0 :
    Math.round((doneHabits + doneTasks) / (activeHabits.length + totalTasks) * 100);

  const pctLabel = pct === 100 ? '¡Día perfecto! 🎉' : pct >= 75 ? '¡Muy bien! 💪' :
    pct >= 50 ? 'Buen avance 👍' : pct >= 25 ? 'Mañana mejor' : 'Recién empieza';

  // Tareas otras
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(p => [...p, { id: crypto.randomUUID(), text: newTask.trim(), done: false }]);
    setNewTask('');
  };
  const toggleTask = id => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = id => setTasks(p => p.filter(t => t.id !== id));

  // Top tareas
  const addTop = () => {
    if (!newTop.trim()) return;
    setTopTasks(p => [...p, { id: crypto.randomUUID(), text: newTop.trim(), done: false }]);
    setNewTop('');
  };
  const toggleTop = id => setTopTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const moods = [
    { id: 'great',  emoji: '🤩', label: 'Genial' },
    { id: 'good',   emoji: '😊', label: 'Bien' },
    { id: 'ok',     emoji: '😐', label: 'Regular' },
    { id: 'hard',   emoji: '😔', label: 'Difícil' },
    { id: 'rough',  emoji: '😩', label: 'Muy duro' },
  ];

  const card = (extra = {}) => ({
    background: T.card, border: `1px solid ${T.cardBorder}`,
    borderRadius: 18, padding: '16px', marginBottom: 12, ...extra,
  });

  // ── Tabs ──
  const tabs = [
    { id: 'morning', icon: '🌅', label: 'Mañana' },
    { id: 'myday',   icon: '📅', label: 'Mi Día' },
    { id: 'night',   icon: '🌙', label: 'Noche'  },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header fijo con tabs */}
      <div style={{ padding: '14px 16px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {tabs.map(t => {
            const active = view === t.id;
            return (
              <button key={t.id} onClick={() => setView(t.id)} style={{
                flex: 1, padding: '9px 4px', borderRadius: 14,
                background: active ? T.accentDim : T.chipInactive,
                color: active ? T.accentText : T.textDim,
                fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'all .18s',
                border: `1px solid ${active ? T.accentBorder : T.cardBorder}`,
              }}>
                {t.icon} {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════ MAÑANA ══════════════ */}
      {view === 'morning' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 100px' }}>

          {/* Card principal del día */}
          <div style={{
            ...card({ padding: '18px', marginBottom: 14 }),
            background: T.isDark
              ? 'linear-gradient(135deg,rgba(99,102,241,.18),rgba(168,85,247,.1))'
              : 'linear-gradient(135deg,rgba(99,102,241,.1),rgba(168,85,247,.06))',
          }}>
            <p style={{ color: T.textDim, fontSize: 12, marginBottom: 4 }}>{dateStr}</p>
            <p style={{ color: T.text, fontSize: 20, fontWeight: 900, marginBottom: 14 }}>¡Un nuevo día! 🌅</p>
            <p style={{ color: T.textDim, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Intención del día</p>
            <textarea
              value={intention}
              onChange={e => setIntention(e.target.value)}
              placeholder="¿Qué quieres lograr hoy?"
              rows={3}
              style={{
                width: '100%', background: T.inputBg, border: `1px solid ${T.inputBorder}`,
                borderRadius: 12, padding: '10px 12px', color: T.text,
                fontFamily: 'Inter,sans-serif', fontSize: 14, resize: 'none',
                outline: 'none', transition: 'border-color .15s',
              }}
            />
          </div>

          {/* Hábitos de hoy */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ color: T.text, fontSize: 16, fontWeight: 800 }}>Hábitos de hoy</p>
            <p style={{ color: T.textDim, fontSize: 13, fontWeight: 600 }}>{doneHabits}/{activeHabits.length}</p>
          </div>

          {activeHabits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', opacity: .4 }}>
              <div style={{ fontSize: 40 }}>🌱</div>
              <p style={{ color: T.textDim, fontSize: 13, marginTop: 10 }}>Sin hábitos para hoy</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeHabits.map(h => (
                <div key={h.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 14,
                  background: h.done ? T.chipInactive : T.rowBg,
                  border: `1px solid ${h.done ? T.cardBorder : T.rowBorder}`,
                  opacity: h.done ? .65 : 1,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: h.done ? T.chipInactive : h.color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, filter: h.done ? 'grayscale(1)' : 'none',
                  }}>{h.icon}</div>
                  <span style={{
                    flex: 1, color: h.done ? T.textDim : T.text, fontSize: 14, fontWeight: 500,
                    textDecoration: h.done ? 'line-through' : 'none',
                  }}>{h.name}</span>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: h.done ? '#22c55e' : 'transparent',
                    border: `2px solid ${h.done ? '#22c55e' : T.textFaint}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {h.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ MI DÍA ══════════════ */}
      {view === 'myday' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 100px' }}>

          {/* Top tareas */}
          <p style={{ color: T.text, fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Top tareas del día</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input
              value={newTop}
              onChange={e => setNewTop(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTop()}
              placeholder="Añadir tarea importante..."
              style={{
                flex: 1, padding: '11px 14px', borderRadius: 12,
                background: T.inputBg, border: `1px solid ${T.inputBorder}`,
                color: T.text, fontFamily: 'Inter,sans-serif', fontSize: 13,
                outline: 'none',
              }}
            />
            <button onClick={addTop} style={{
              width: 42, height: 42, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: T.accentGrad, color: '#fff', fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>+</button>
          </div>

          {topTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {topTasks.map(t => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 14,
                  background: t.done ? T.chipInactive : T.isDark ? 'rgba(99,102,241,.12)' : 'rgba(99,102,241,.07)',
                  border: `1px solid ${t.done ? T.cardBorder : T.accentBorder}`,
                }}>
                  <div onClick={() => toggleTop(t.id)} style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                    background: t.done ? T.accent : 'transparent',
                    border: `2px solid ${t.done ? T.accent : T.textFaint}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s',
                  }}>
                    {t.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <span style={{
                    flex: 1, color: t.done ? T.textDim : T.text, fontSize: 14, fontWeight: 600,
                    textDecoration: t.done ? 'line-through' : 'none',
                  }}>{t.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Otras tareas */}
          <p style={{ color: T.textDim, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Otras tareas</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {tasks.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 14,
                background: T.rowBg, border: `1px solid ${T.rowBorder}`,
              }}>
                <div onClick={() => toggleTask(t.id)} style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                  background: t.done ? T.accent : 'transparent',
                  border: `2px solid ${t.done ? T.accent : T.textFaint}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s',
                }}>
                  {t.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
                <span style={{
                  flex: 1, color: t.done ? T.textDim : T.text, fontSize: 14, fontWeight: 500,
                  textDecoration: t.done ? 'line-through' : 'none',
                }}>{t.text}</span>
                <button onClick={() => deleteTask(t.id)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: T.textFaint, fontSize: 18, padding: '0 4px',
                }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="+ tarea"
              style={{
                flex: 1, padding: '11px 14px', borderRadius: 12,
                background: T.inputBg, border: `1px solid ${T.inputBorder}`,
                color: T.text, fontFamily: 'Inter,sans-serif', fontSize: 13, outline: 'none',
              }}
            />
            <button onClick={addTask} style={{
              padding: '10px 16px', borderRadius: 12, border: 'none',
              background: T.accentGrad, color: '#fff',
              fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Añadir</button>
          </div>
        </div>
      )}

      {/* ══════════════ NOCHE ══════════════ */}
      {view === 'night' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 100px' }}>

          {/* Card revisión */}
          <div style={{
            ...card({ padding: '18px', marginBottom: 14 }),
            background: T.isDark
              ? 'linear-gradient(135deg,rgba(99,102,241,.18),rgba(168,85,247,.1))'
              : 'linear-gradient(135deg,rgba(99,102,241,.1),rgba(168,85,247,.06))',
          }}>
            <p style={{ color: T.textDim, fontSize: 12, marginBottom: 4 }}>{dateStr}</p>
            <p style={{ color: T.text, fontSize: 20, fontWeight: 900, marginBottom: 14 }}>Revisión del día 🌙</p>
            <p style={{ color: T.textDim, fontSize: 13, lineHeight: 1.5 }}>Reflexiona sobre tu jornada. Cada día que revisas es un día que aprendes.</p>

            {/* Ring + resumen */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, padding: '14px', background: T.card, borderRadius: 14 }}>
              <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                <Ring pct={pct} size={64} stroke={6} color={pct >= 75 ? '#22c55e' : pct >= 50 ? '#f97316' : '#ef4444'}/>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: T.text, fontSize: 12, fontWeight: 800 }}>{pct}%</span>
                </div>
              </div>
              <div>
                <p style={{ color: T.text, fontSize: 16, fontWeight: 800 }}>{pctLabel}</p>
                <p style={{ color: T.textDim, fontSize: 12, marginTop: 3 }}>{doneHabits}/{activeHabits.length} hábitos · {doneTasks}/{totalTasks} tareas</p>
              </div>
            </div>
          </div>

          {/* ¿Cómo fue tu día? */}
          <div style={card()}>
            <p style={{ color: T.text, fontSize: 15, fontWeight: 700, marginBottom: 14 }}>¿Cómo fue tu día? 🗓</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ id: 'great', emoji: '🤩', label: 'Genial' }, { id: 'good', emoji: '😊', label: 'Bien' }, { id: 'ok', emoji: '😐', label: 'Regular' }, { id: 'hard', emoji: '😔', label: 'Difícil' }, { id: 'rough', emoji: '😩', label: 'Muy duro' }].map(m => (
                <button key={m.id} onClick={() => setMood(m.id)} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: mood === m.id ? 'rgba(99,102,241,.2)' : T.chipInactive,
                  border: `1.5px solid ${mood === m.id ? T.accentBorder : T.cardBorder}`,
                  transition: 'all .18s',
                }}>
                  <div style={{ fontSize: 22 }}>{m.emoji}</div>
                  <div style={{ color: mood === m.id ? T.accentText : T.textDim, fontSize: 10, fontWeight: 600, marginTop: 4 }}>{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Intención */}
          {intention && (
            <div style={card()}>
              <p style={{ color: T.text, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Tu intención del día</p>
              <p style={{ color: T.textDim, fontSize: 14, fontStyle: 'italic', marginBottom: 14 }}>"{intention}"</p>
              <p style={{ color: T.textDim, fontSize: 13, marginBottom: 10 }}>¿La cumpliste?</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ id: 'done', label: 'Sí, la viví ✅' }, { id: 'partial', label: 'En parte 🤏' }, { id: 'no', label: 'No hoy ⏳' }].map(r => (
                  <button key={r.id} onClick={() => setResult(r.id)} style={{
                    flex: 1, padding: '10px 6px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: result === r.id ? T.accentDim : T.chipInactive,
                    border: `1.5px solid ${result === r.id ? T.accentBorder : T.cardBorder}`,
                    color: result === r.id ? T.accentText : T.textDim,
                    fontFamily: 'Inter,sans-serif', fontSize: 11, fontWeight: 600,
                    transition: 'all .18s',
                  }}>{r.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Revisión de hábitos */}
          {activeHabits.length > 0 && (
            <div style={card()}>
              <p style={{ color: T.text, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Revisión de hábitos 📋</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeHabits.map(h => (
                  <div key={h.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: 12,
                    background: h.done ? 'rgba(34,197,94,.08)' : T.chipInactive,
                    border: `1px solid ${h.done ? 'rgba(34,197,94,.2)' : T.cardBorder}`,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: h.done ? h.color + '22' : T.chipInactive,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, filter: h.done ? 'none' : 'grayscale(1)',
                    }}>{h.icon}</div>
                    <span style={{ flex: 1, color: T.text, fontSize: 14, fontWeight: 500 }}>{h.name}</span>
                    {h.done
                      ? <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>✓ Completado</span>
                      : <span style={{ color: '#f97316', fontSize: 13, fontWeight: 700 }}>▼ Perdido</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MiDiaScreen });
