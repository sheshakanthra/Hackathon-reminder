// ─────────────────────────────────────────────────────────────
//  localStorage Data Layer  –  replaces Express/MongoDB API calls
//
//  Field normalization:
//    Legacy names  (from existing DB) : registrationDeadline, pptDeadline, prize
//    AI-extracted  (from Groq)        : registration_deadline, submission_deadline, prize_pool
//  Both are accepted on write; reads always expose the legacy names for
//  backward-compat with HackathonCard / CountdownTimer.
// ─────────────────────────────────────────────────────────────

const HACK_KEY = 'hackreminder_hackathons';

/** Flatten both naming conventions into a single canonical shape */
const normalize = (data) => {
  const out = { ...data };

  // Deadline fields
  if (!out.registrationDeadline && out.registration_deadline)
    out.registrationDeadline = out.registration_deadline;
  if (!out.pptDeadline && out.submission_deadline)
    out.pptDeadline = out.submission_deadline;

  // Prize field
  if (!out.prize && out.prize_pool) out.prize = out.prize_pool;

  // Defaults
  if (!out.status)   out.status   = 'registered';
  if (!out.location) out.location = 'Online';
  if (!out.prize)    out.prize    = 'TBD';

  return out;
};

// ── CRUD ──────────────────────────────────────────────────────

export const getHackathons = () => {
  try {
    const raw = localStorage.getItem(HACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveHackathon = (data) => {
  const existing = getHackathons();
  const item = {
    ...normalize(data),
    _id:       data._id       || crypto.randomUUID(),
    createdAt: data.createdAt || new Date().toISOString(),
  };
  localStorage.setItem(HACK_KEY, JSON.stringify([...existing, item]));
  return item;
};

export const updateHackathon = (id, patch) => {
  const existing = getHackathons();
  const updated  = existing.map(h => (h._id === id ? { ...h, ...normalize(patch) } : h));
  localStorage.setItem(HACK_KEY, JSON.stringify(updated));
};

export const deleteHackathon = (id) => {
  const existing = getHackathons();
  localStorage.setItem(HACK_KEY, JSON.stringify(existing.filter(h => h._id !== id)));
};

// ── Email reminder tracking ────────────────────────────────────

const REMINDER_KEY = 'hackreminder_sent_reminders';

export const getReminderState = () => {
  try { return JSON.parse(localStorage.getItem(REMINDER_KEY) || '{}'); }
  catch { return {}; }
};

export const setReminderSent = (hackId, type) => {
  const state = getReminderState();
  if (!state[hackId]) state[hackId] = {};
  state[hackId][type] = new Date().toISOString();
  localStorage.setItem(REMINDER_KEY, JSON.stringify(state));
};

// ── Google Calendar event ID tracking ─────────────────────────

const CAL_KEY = 'hackreminder_calendar_events';

export const getCalendarEvents = () => {
  try { return JSON.parse(localStorage.getItem(CAL_KEY) || '{}'); }
  catch { return {}; }
};

export const setCalendarEvent = (hackId, eventIds) => {
  const events = getCalendarEvents();
  events[hackId] = eventIds;
  localStorage.setItem(CAL_KEY, JSON.stringify(events));
};
