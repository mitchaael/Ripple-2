// ─── app-myday.jsx — Pantalla "Mi Día" ────────────────────────

function MiDiaScreen({ habits }) {
  const T = useT();
  const today = new Date();
  const todayKey = todayStr();
  const dayName = DAYS_FULL[today.getDay()];
  const dateStr = today.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Buenos días ☀️' : hour < 18 ? 'Buenas tardes 🌤' : 'Buenas noches 🌙';

  // Filtrar hábitos activos hoy según frecuencia
  const active = habits.filter(h => {
    const dow = today.getDay();
    return h.frequency === 'daily'
      || (h.frequency === 'weekdays' && dow >= 1 && dow <= 5)
      || (h.frequency === 'weekends' && (dow === 0 || dow === 6));
  });

  const done  = active.filter(h => h.done).length;
  const total = active.length;
  const pct   = total === 0 ? 0 : Math.round(done / total * 100);

  // Separar con y sin hora programada
  const withTime    = active.filter(h => h.scheduledTime).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const withoutTime = active.filter(h => !h.scheduledTime);

  const card = (extra) => ({
    background: T.card,
    border: `1px solid ${T.cardBorder}`,
    borderRadius: 18,
    ...extra,
  });

  // Bloques de tiempo del día
  const timeBlocks = [
    { label: 'Mañana', icon: '🌅', range: [6, 12] },
    { label: 'Tarde',  icon: '☀️', range: [12, 18] },
    { label: 'Noche',  icon: '🌙', range: [18, 24] },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '16px 18px 12px', flexShrink: 0 }}>
        <p style={{ color: T.textDim, fontSize: 11, fontWeight: 500, marginBottom: 2 }}>{greeting}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: T.text, fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>Mi Día</p>
            <p style={{ color: T.textDim, fontSize: 13, marginTop: 2 }}>{dayName} · {dateStr}</p>
          </div>
          {total > 0 && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: T.text, fontSize: 22, fontWeight: 800 }}>{pct}%</p>
              <p style={{ color: T.textDim, fontSize: 11 }}>{done}/{total} hechos</p>
            </div>
          )}
        </div>

        {/* Barra de progreso */}
        {total > 0 && (
          <div style={{ marginTop: 12, height: 5, background: T.chipInactive, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: pct === 100 ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#6366f1,#a855f7)',
              borderRadius: 99, transition: 'width .8s ease',
            }} />
          </div>
        )}
      </div>

      {/* Contenido scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 100px' }}>

        {active.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 70, opacity: .4 }}>
            <div style={{ fontSize: 52 }}>📅</div>
            <p style={{ color: T.textDim, marginTop: 14, fontSize: 15, fontWeight: 600 }}>Sin hábitos para hoy</p>
            <p style={{ color: T.textFaint, fontSize: 13, marginTop: 6 }}>Ve a Inicio para añadir hábitos</p>
          </div>
        ) : (
          <>
            {/* Hábitos con hora programada agrupados por bloque */}
            {withTime.length > 0 && timeBlocks.map(block => {
              const blockHabits = withTime.filter(h => {
                const hh = parseInt(h.scheduledTime.split(':')[0], 10);
                return hh >= block.range[0] && hh < block.range[1];
              });
              if (blockHabits.length === 0) return null;
              return (
                <div key={block.label} style={{ marginBottom: 18 }}>
                  <p style={{ color: T.sectionLabel, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 8 }}>
                    {block.icon} {block.label}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {blockHabits.map(h => <MiDiaRow key={h.id} habit={h} T={T} />)}
                  </div>
                </div>
              );
            })}

            {/* Hábitos sin hora */}
            {withoutTime.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <p style={{ color: T.sectionLabel, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 8 }}>
                  ⚡ En cualquier momento
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {withoutTime.map(h => <MiDiaRow key={h.id} habit={h} T={T} />)}
                </div>
              </div>
            )}

            {/* Mensaje de día perfecto */}
            {done === total && total > 0 && (
              <div style={{
                ...card({ padding: '18px', textAlign: 'center', marginTop: 8 }),
                background: 'linear-gradient(135deg,rgba(34,197,94,.12),rgba(22,163,74,.07))',
                border: '1px solid rgba(34,197,94,.25)',
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <p style={{ color: '#22c55e', fontSize: 17, fontWeight: 800 }}>¡Día perfecto!</p>
                <p style={{ color: T.textDim, fontSize: 13, marginTop: 4 }}>Completaste todos tus hábitos de hoy</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Fila de hábito en Mi Día ─────────────────────────────────
function MiDiaRow({ habit: h, T }) {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  let timeStatus = null;
  if (h.scheduledTime) {
    const [hh, mm] = h.scheduledTime.split(':').map(Number);
    const habitMins = hh * 60 + mm;
    const diff = habitMins - nowMins;
    if (!h.done) {
      if (diff < 0)        timeStatus = { label: 'Pasado', color: '#f87171' };
      else if (diff < 15)  timeStatus = { label: 'Ahora',  color: '#f97316' };
      else if (diff < 60)  timeStatus = { label: `En ${diff}min`, color: '#eab308' };
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 14px',
      background: h.done ? T.chipInactive : T.rowBg,
      border: `1px solid ${h.done ? 'rgba(34,197,94,.2)' : T.rowBorder}`,
      borderRadius: 16,
      opacity: h.done ? .65 : 1,
      transition: 'all .2s',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: h.done ? T.chipInactive : h.color + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
        filter: h.done ? 'grayscale(1)' : 'none',
      }}>
        {h.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          color: h.done ? T.textDim : T.text, fontSize: 14, fontWeight: 600,
          textDecoration: h.done ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{h.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
          {h.scheduledTime && (
            <span style={{ fontSize: 11, color: timeStatus ? timeStatus.color : T.textFaint, fontWeight: 600 }}>
              🕐 {h.scheduledTime}
            </span>
          )}
          {timeStatus && !h.done && (
            <span style={{
              fontSize: 10, color: timeStatus.color, fontWeight: 700,
              background: timeStatus.color + '18', padding: '1px 7px', borderRadius: 99,
            }}>{timeStatus.label}</span>
          )}
          {(h.streak || 0) > 0 && (
            <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600, background: 'rgba(249,115,22,.12)', padding: '1px 7px', borderRadius: 99 }}>
              🔥 {h.streak}d
            </span>
          )}
        </div>
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: h.done ? '#22c55e' : 'transparent',
        border: `2px solid ${h.done ? '#22c55e' : T.textFaint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .22s',
      }}>
        {h.done && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { MiDiaScreen, MiDiaRow });
