import { useState, useCallback } from 'react';
import KanbanBoard from '../components/workflow/KanbanBoard';
import HackathonDetailPanel from '../components/workflow/HackathonDetailPanel';
import WinsShowcase from '../components/workflow/WinsShowcase';
import { getHackathons, updateHackathon } from '../services/localStorage';

// ── Custom hook — keeps hackathons in sync with localStorage ───
const useHackathons = () => {
  const [hackathons, setHackathons] = useState(() => getHackathons());

  const refresh = useCallback(() => setHackathons(getHackathons()), []);

  const patch = useCallback((id, changes) => {
    updateHackathon(id, changes);
    setHackathons(getHackathons());
  }, []);

  return { hackathons, refresh, patch };
};

// ── Workflow Page ──────────────────────────────────────────────

const Workflow = () => {
  const { hackathons, patch }               = useHackathons();
  const [selectedHack, setSelectedHack]     = useState(null);
  const [openTabHint, setOpenTabHint]       = useState(null);

  // ── Drag-and-drop handler ────────────────────────────────────
  const handleDragEnd = (result) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId &&
        destination.index === source.index) return;

    const newStatus = destination.droppableId;
    patch(draggableId, { status: newStatus });

    // Keep detail panel in sync if the moved card is currently selected
    if (selectedHack?._id === draggableId) {
      setSelectedHack(prev => ({ ...prev, status: newStatus }));
    }
  };

  // ── Card click ───────────────────────────────────────────────
  const handleCardClick = (hack, tabHint = null) => {
    setSelectedHack(hack);
    if (tabHint) setOpenTabHint(tabHint);
  };

  // ── Detail panel update ──────────────────────────────────────
  const handlePanelUpdate = (changes) => {
    if (!selectedHack) return;
    patch(selectedHack._id, changes);
    setSelectedHack(prev => ({ ...prev, ...changes }));
  };

  return (
    <div className="min-h-screen">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-black text-gray-900">Workflow</h1>
          <span className="px-3 py-1 text-xs font-black uppercase tracking-widest
                           bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full">
            ✦ Live
          </span>
        </div>
        <p className="text-gray-500">
          Drag hackathons between stages · Click any card to open the detail panel
        </p>
      </div>

      {hackathons.length === 0 ? (
        /* ── Empty state ──────────────────────────────────────── */
        <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-5xl mb-4">🏗️</p>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No hackathons yet</h2>
          <p className="text-gray-400 mb-6">Add hackathons from the Dashboard — they'll appear here.</p>
          <a href="/"
             className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
            ← Go to Dashboard
          </a>
        </div>
      ) : (
        <>
          {/* ── Section A: Kanban Board ────────────────────────── */}
          <section className="mb-2">
            <KanbanBoard
              hackathons={hackathons}
              onDragEnd={handleDragEnd}
              onCardClick={handleCardClick}
            />
          </section>

          {/* ── Section B: Detail Panel ───────────────────────── */}
          {selectedHack && (
            <HackathonDetailPanel
              hackathon={selectedHack}
              initialTab={openTabHint}
              onClose={() => { setSelectedHack(null); setOpenTabHint(null); }}
              onUpdate={handlePanelUpdate}
            />
          )}

          {/* ── Section C: Wins Showcase ──────────────────────── */}
          <WinsShowcase hackathons={hackathons} />
        </>
      )}
    </div>
  );
};

export default Workflow;
