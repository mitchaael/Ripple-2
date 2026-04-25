// ─── app-notifications.js — Web Notifications manager v2 ─────
// Requires: todayStr, habits with scheduledTime from globals

const NOTIF_KEY = 'mh4_notif_prefs';

const defaultNotifPrefs = () => ({
  enabled:        false,
  morning:        true,
  morningTime:    '08:00',
  evening:        true,
  eveningTime:    '20:00',
  habitReminders: true,
  reminderOffset: 5, // minutes before habit time
});

function loadNotifPrefs() {
  try { const v = localStorage.getItem(NOTIF_KEY); return v ? {...defaultNotifPrefs(),...JSON.parse(v)} : defaultNotifPrefs(); }
  catch { return defaultNotifPrefs(); }
}
function saveNotifPrefs(prefs) { localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs)); }

// ─── Permission ───────────────────────────────────────────────
async function requestNotifPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied')  return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

function getNotifPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

// ─── Fire a notification ──────────────────────────────────────
function fireNotification(title, body, icon = '🎯') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">' + icon + '</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⭐</text></svg>',
      tag: title,
      renotify: false,
    });
  } catch(e) { console.warn('Notification failed:', e); }
}

// ─── Scheduler ────────────────────────────────────────────────
const _timers = [];

function clearAllTimers() {
  _timers.forEach(t => clearTimeout(t));
  _timers.length = 0;
}

function msUntil(timeStr) {
  // timeStr = "HH:MM"
  const [h, m]   = timeStr.split(':').map(Number);
  const now      = new Date();
  const target   = new Date();
  target.setHours(h, m, 0, 0);
  let ms = target - now;
  // Already passed today → don't schedule
  if (ms < 0) return null;
  return ms;
}

function scheduleNotifications(habits, prefs) {
  clearAllTimers();
  if (!prefs.enabled || getNotifPermission() !== 'granted') return;

  // Morning reminder
  if (prefs.morning) {
    const ms = msUntil(prefs.morningTime || '08:00');
    if (ms !== null) {
      const activeToday = habits.filter(h => {
        const dow = new Date().getDay();
        return h.frequency==='daily' ||
          (h.frequency==='weekdays' && dow>=1 && dow<=5) ||
          (h.frequency==='weekends' && (dow===0||dow===6));
      });
      const t = setTimeout(() => {
        fireNotification(
          '¡Buenos días! ☀️',
          `Tienes ${activeToday.length} hábito${activeToday.length!==1?'s':''} para hoy. ¡Tú puedes!`,
          '☀️'
        );
      }, ms);
      _timers.push(t);
    }
  }

  // Evening reminder
  if (prefs.evening) {
    const ms = msUntil(prefs.eveningTime || '20:00');
    if (ms !== null) {
      const t = setTimeout(() => {
        fireNotification(
          '🌙 Revisión del día',
          '¿Completaste tus hábitos? Tómate un momento para reflexionar.',
          '🌙'
        );
      }, ms);
      _timers.push(t);
    }
  }

  // Per-habit scheduled reminders
  if (prefs.habitReminders) {
    habits.forEach(h => {
      if (!h.scheduledTime || h.done) return;
      const [hh, mm] = h.scheduledTime.split(':').map(Number);
      const offset   = prefs.reminderOffset || 5;
      const remind   = `${String(hh).padStart(2,'0')}:${String(Math.max(0, mm - offset)).padStart(2,'0')}`;
      const ms = msUntil(remind);
      if (ms === null) return;
      const t = setTimeout(() => {
        if (h.done) return; // already done
        fireNotification(
          `${h.icon} ${h.name}`,
          `En ${offset} min — ¡Es hora de ${h.name.toLowerCase()}!`,
          h.icon
        );
      }, ms);
      _timers.push(t);
    });
  }
}

// Export to window
Object.assign(window, {
  NOTIF_KEY, defaultNotifPrefs, loadNotifPrefs, saveNotifPrefs,
  requestNotifPermission, getNotifPermission, fireNotification,
  scheduleNotifications, clearAllTimers,
});
