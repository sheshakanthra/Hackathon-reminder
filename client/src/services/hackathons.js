// ─────────────────────────────────────────────────────────────
//  Hackathon data service — Supabase backend
//
//  Supabase table columns (snake_case):
//    id, user_id, name, location, prize_pool, description,
//    category, priority, status, registration_deadline,
//    submission_deadline, source_url, notes, team (jsonb),
//    calendar_event_id, created_at
//
//  Component field names (camelCase / legacy):
//    _id, registrationDeadline, pptDeadline, prize
//
//  fromDb() normalizes DB → component.
//  toDb()   normalizes component → DB (only maps present keys).
// ─────────────────────────────────────────────────────────────

import { supabase } from '../lib/supabaseClient';

// ── Field normalization ────────────────────────────────────────

const fromDb = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id:                  row.id,                      // backward compat
    registrationDeadline: row.registration_deadline,   // backward compat
    pptDeadline:          row.submission_deadline,     // backward compat
    prize:                row.prize_pool,              // backward compat
  };
};

/** Map component field names → DB column names. Only maps keys that exist in data. */
const toDb = (data) => {
  const FIELD_MAP = {
    name:                  'name',
    location:              'location',
    prize:                 'prize_pool',
    prize_pool:            'prize_pool',
    description:           'description',
    category:              'category',
    priority:              'priority',
    status:                'status',
    registrationDeadline:  'registration_deadline',
    registration_deadline: 'registration_deadline',
    pptDeadline:           'submission_deadline',
    submission_deadline:   'submission_deadline',
    notes:                 'notes',
    team:                  'team',
    source_url:            'source_url',
    calendar_event_id:     'calendar_event_id',
  };

  const out = {};
  for (const [from, to] of Object.entries(FIELD_MAP)) {
    if (from in data && data[from] !== undefined) {
      out[to] = data[from];
    }
  }
  return out;
};

// ── CRUD ──────────────────────────────────────────────────────

/** Fetch all hackathons for the logged-in user (RLS handles filtering). */
export const getHackathons = async () => {
  const { data, error } = await supabase
    .from('hackathons')
    .select('*')
    .order('registration_deadline', { ascending: true });

  if (error) throw error;
  return (data || []).map(fromDb);
};

/** Insert a new hackathon. userId comes from Supabase auth session. */
export const saveHackathon = async (hackData, userId) => {
  const row = {
    ...toDb(hackData),
    user_id: userId,
    status:  hackData.status || 'registered',
  };

  const { data, error } = await supabase
    .from('hackathons')
    .insert([row])
    .select()
    .single();

  if (error) throw error;
  return fromDb(data);
};

/** Patch specific fields on an existing hackathon. */
export const updateHackathon = async (id, patch) => {
  const dbPatch = toDb(patch);
  if (Object.keys(dbPatch).length === 0) return; // nothing to update

  const { error } = await supabase
    .from('hackathons')
    .update(dbPatch)
    .eq('id', id);

  if (error) throw error;
};

/** Delete a hackathon by id. */
export const deleteHackathon = async (id) => {
  const { error } = await supabase
    .from('hackathons')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
