import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateHackathon } from '../../services/localStorage';
import { CountdownBadge } from './CountdownBadge';

// ── Tab list ───────────────────────────────────────────────────
const TABS = ['Overview', 'Timeline', 'Team', 'Notes', 'Reminders'];

// ── Helpers ────────────────────────────────────────────────────
const fmt = (iso) => iso
  ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
  : '—';

// ── Tab: Overview ──────────────────────────────────────────────
const OverviewTab = ({ hack, onUpdate }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(hack.submissionProgress || 0);

  const saveProgress = (val) => {
    setProgress(val);
    onUpdate({ submissionProgress: val });
  };

  const addToGoogleCalendar = () => {
    const title = encodeURIComponent(`⏰ ${hack.name} — Registration Closes`);
    const dl    = hack.registrationDeadline
      ? new Date(hack.registrationDeadline).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dl}/${dl}&details=${encodeURIComponent(hack.description || '')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Row 1 */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-black text-gray-900 flex-1">{hack.name}</h2>
        {hack.registrationDeadline && (
          <CountdownBadge targetDate={hack.registrationDeadline} />
        )}
        {hack.category && (
          <span className="text-xs font-bold px-3 py-1 bg-violet-100 text-violet-700 rounded-full">
            {hack.category}
          </span>
        )}
      </div>

      {/* Row 2 — stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '💰 Prize Pool', val: hack.prize || hack.prize_pool || 'TBD' },
          { label: '📍 Location',   val: hack.location || 'Online' },
          { label: '🎯 Priority',   val: hack.priority || 'Medium' },
        ].map(({ label, val }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="font-bold text-gray-900 text-sm">{val}</p>
          </div>
        ))}
      </div>

      {/* Submission progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
            Submission Progress
          </span>
          <span className="text-sm font-black text-indigo-600">{progress}%</span>
        </div>
        <input
          type="range" min="0" max="100" value={progress}
          onChange={e => saveProgress(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Timeline</h3>
        <div className="space-y-3">
          {[
            { icon: '✅', label: 'Registration Deadline', date: hack.registrationDeadline, done: true  },
            { icon: '📤', label: 'Submission Deadline',   date: hack.pptDeadline,           done: false },
          ].filter(e => e.date).map(({ icon, label, date, done }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-lg w-6">{icon}</span>
              <div>
                <p className={`text-sm font-bold ${done ? 'text-gray-800' : 'text-indigo-700'}`}>{label}</p>
                <p className="text-xs text-gray-500">{fmt(date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={addToGoogleCalendar}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
        >
          📅 Google Calendar
        </button>
        {hack.devpostUrl && (
          <a href={hack.devpostUrl} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm">
            🔗 Devpost Link
          </a>
        )}
        <button
          onClick={() => navigate(`/edit/${hack._id}`)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
        >
          ✏️ Edit
        </button>
      </div>
    </div>
  );
};

// ── Tab: Timeline ──────────────────────────────────────────────
const TimelineTab = ({ hack, onUpdate }) => {
  const [milestones, setMilestones] = useState(hack.milestones || [
    { id: '1', label: 'Registration confirmed', date: hack.registrationDeadline, done: true  },
    { id: '2', label: 'Submission deadline',    date: hack.pptDeadline,           done: false },
  ]);
  const [newLabel, setNewLabel] = useState('');

  const toggle = (id) => {
    const updated = milestones.map(m => m.id === id ? { ...m, done: !m.done } : m);
    setMilestones(updated);
    onUpdate({ milestones: updated });
  };

  const addMilestone = () => {
    if (!newLabel.trim()) return;
    const updated = [...milestones, { id: crypto.randomUUID(), label: newLabel.trim(), date: null, done: false }];
    setMilestones(updated);
    onUpdate({ milestones: updated });
    setNewLabel('');
  };

  return (
    <div className="space-y-3">
      {milestones.map(m => (
        <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <input type="checkbox" checked={m.done} onChange={() => toggle(m.id)}
                 className="w-4 h-4 accent-indigo-600 cursor-pointer" />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${m.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {m.label}
            </p>
            {m.date && <p className="text-xs text-gray-500">{fmt(m.date)}</p>}
          </div>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <input
          value={newLabel} onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMilestone()}
          placeholder="+ Add milestone (e.g. Code freeze)"
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        <button onClick={addMilestone}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
          Add
        </button>
      </div>
    </div>
  );
};

// ── Tab: Team ──────────────────────────────────────────────────
const TeamTab = ({ hack, onUpdate }) => {
  const [team, setTeam] = useState(hack.team || []);
  const [form, setForm] = useState({ name: '', role: '', email: '' });

  const addMember = () => {
    if (!form.name.trim()) return;
    const updated = [...team, { ...form, id: crypto.randomUUID() }];
    setTeam(updated);
    onUpdate({ team: updated });
    setForm({ name: '', role: '', email: '' });
  };

  const remove = (id) => {
    const updated = team.filter(m => m.id !== id);
    setTeam(updated);
    onUpdate({ team: updated });
  };

  return (
    <div className="space-y-4">
      {/* Avatar row */}
      {team.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {team.map(m => (
            <div key={m.id} className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500
                              flex items-center justify-center text-white font-bold text-lg shadow-md">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs font-semibold text-gray-700">{m.name}</p>
              <p className="text-[10px] text-gray-500">{m.role}</p>
              <button onClick={() => remove(m.id)}
                      className="text-[10px] text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Add teammate */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Add Teammate</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {['name', 'role', 'email'].map(f => (
            <input key={f} value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                   placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                   className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          ))}
        </div>
        <button onClick={addMember}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
          + Add to Team
        </button>
      </div>
    </div>
  );
};

// ── Tab: Notes ─────────────────────────────────────────────────
const NotesTab = ({ hack, onUpdate }) => {
  const [notes, setNotes] = useState(hack.notes || '');
  const [savedAt, setSavedAt] = useState(hack.notesSavedAt || null);
  const MAX = 2000;

  const save = () => {
    const ts = new Date().toISOString();
    onUpdate({ notes, notesSavedAt: ts });
    setSavedAt(ts);
  };

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value.slice(0, MAX))}
        onBlur={save}
        placeholder="Add your notes, ideas, links, team strategy…"
        rows={10}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
      />
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{notes.length} / {MAX} chars</span>
        {savedAt && <span>Last saved: {new Date(savedAt).toLocaleTimeString()}</span>}
      </div>
      <button onClick={save}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
        Save Notes
      </button>
    </div>
  );
};

// ── Tab: Reminders ─────────────────────────────────────────────
const RemindersTab = ({ hack }) => {
  const sentState   = JSON.parse(localStorage.getItem('hackreminder_sent_reminders') || '{}');
  const hackState   = sentState[hack._id] || {};

  const slots = [
    { key: 'reg_7d', label: '🔔 7 days before Registration',  deadline: hack.registrationDeadline },
    { key: 'reg_1d', label: '🔔 1 day before Registration',   deadline: hack.registrationDeadline },
    { key: 'reg_0d', label: '🔔 Day of Registration',         deadline: hack.registrationDeadline },
    { key: 'sub_7d', label: '🔔 7 days before Submission',    deadline: hack.pptDeadline },
    { key: 'sub_1d', label: '🔔 1 day before Submission',     deadline: hack.pptDeadline },
    { key: 'sub_0d', label: '🔔 Day of Submission',           deadline: hack.pptDeadline },
  ].filter(s => s.deadline);

  const resend = (key) => {
    // Clear sent flag for this key so it fires on next app load
    const state = JSON.parse(localStorage.getItem('hackreminder_sent_reminders') || '{}');
    if (state[hack._id]) delete state[hack._id][key];
    localStorage.setItem('hackreminder_sent_reminders', JSON.stringify(state));
    alert('Reminder reset — it will re-send on next app load.');
  };

  return (
    <div className="space-y-3">
      {slots.map(({ key, label }) => {
        const sent = hackState[key];
        return (
          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className={`text-xs font-medium mt-0.5 ${sent ? 'text-emerald-600' : 'text-gray-400'}`}>
                {sent ? `✓ Sent ${new Date(sent).toLocaleDateString()}` : 'Pending'}
              </p>
            </div>
            {sent && (
              <button onClick={() => resend(key)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition px-3 py-1.5 bg-indigo-50 rounded-lg">
                Resend
              </button>
            )}
          </div>
        );
      })}
      {slots.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No deadlines set for this hackathon.</p>
      )}
    </div>
  );
};

// ── Detail Panel (5-tab shell) ─────────────────────────────────

const HackathonDetailPanel = ({ hackathon, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  if (!hackathon) return null;

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden
                    animate-in slide-in-from-bottom-4 duration-300">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-violet-50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
          <h2 className="font-black text-gray-900 text-lg">{hackathon.name}</h2>
        </div>
        <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center
                           text-gray-500 hover:text-gray-900 hover:border-gray-300 transition shadow-sm">
          ✕
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-gray-100 px-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors
              ${activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6 max-h-[520px] overflow-y-auto">
        {activeTab === 'Overview'   && <OverviewTab   hack={hackathon} onUpdate={onUpdate} />}
        {activeTab === 'Timeline'   && <TimelineTab   hack={hackathon} onUpdate={onUpdate} />}
        {activeTab === 'Team'       && <TeamTab        hack={hackathon} onUpdate={onUpdate} />}
        {activeTab === 'Notes'      && <NotesTab       hack={hackathon} onUpdate={onUpdate} />}
        {activeTab === 'Reminders'  && <RemindersTab   hack={hackathon} />}
      </div>
    </div>
  );
};

export default HackathonDetailPanel;
