import { Draggable } from '@hello-pangea/dnd';
import { CountdownBadge } from './CountdownBadge';

// ── Helpers ────────────────────────────────────────────────────

const PRIORITY_STYLES = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High:     'bg-orange-100 text-orange-700 border-orange-200',
  Medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low:      'bg-blue-100 text-blue-700 border-blue-200',
};

const STATUS_BADGE = {
  registered:  { label: 'In Progress',  cls: 'bg-gray-100 text-gray-600'    },
  submitted:   { label: 'Submitted',    cls: 'bg-indigo-100 text-indigo-700' },
  shortlisted: { label: 'Shortlisted',  cls: 'bg-blue-100 text-blue-700'    },
  won:         { label: '🏆 Won',        cls: 'bg-amber-100 text-amber-700'  },
};

// ── KanbanCard ─────────────────────────────────────────────────

const KanbanCard = ({ hackathon, index, onClick }) => {
  const status  = STATUS_BADGE[hackathon.status] || STATUS_BADGE.registered;
  const prioStyle = PRIORITY_STYLES[hackathon.priority] || PRIORITY_STYLES.Medium;
  const deadline  = hackathon.registrationDeadline || hackathon.pptDeadline;

  return (
    <Draggable draggableId={hackathon._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(hackathon)}
          className={`bg-white rounded-xl border p-4 cursor-pointer select-none
            transition-all duration-200 group
            ${snapshot.isDragging
              ? 'shadow-2xl shadow-indigo-200 border-indigo-300 rotate-1 scale-[1.02]'
              : 'shadow-sm border-gray-200 hover:shadow-md hover:border-indigo-200'
            }`}
        >
          {/* Name + status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
              {hackathon.name}
            </h3>
            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>
              {status.label}
            </span>
          </div>

          {/* Location · Prize */}
          <p className="text-xs text-gray-500 mb-3">
            {[hackathon.location, hackathon.prize || hackathon.prize_pool]
              .filter(Boolean).join(' · ')}
          </p>

          {/* Countdown */}
          {deadline && (
            <div className="mb-3">
              <CountdownBadge targetDate={deadline} compact />
            </div>
          )}

          {/* Tags row */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {hackathon.category && (
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full border border-violet-100">
                {hackathon.category}
              </span>
            )}
            {hackathon.priority && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${prioStyle}`}>
                {hackathon.priority}
              </span>
            )}
          </div>

          {/* Won extras */}
          {hackathon.status === 'won' && (
            <div className="mt-3 pt-3 border-t border-amber-100 flex gap-2">
              {hackathon.prizeWon && (
                <span className="text-xs font-bold text-amber-700">🏆 {hackathon.prizeWon}</span>
              )}
              {hackathon.place && (
                <span className="text-xs text-amber-600">{hackathon.place}</span>
              )}
            </div>
          )}

          {/* Shortlisted extras */}
          {hackathon.status === 'shortlisted' && (
            <div className="mt-2">
              <button
                onClick={e => { e.stopPropagation(); onClick(hackathon, 'notes'); }}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition"
              >
                + Add Notes
              </button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
