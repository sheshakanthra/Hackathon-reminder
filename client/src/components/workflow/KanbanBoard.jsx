import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

// ── Column config ──────────────────────────────────────────────

const COLUMNS = [
  { id: 'registered',  label: 'Registered',   icon: '📋', headerCls: 'border-t-indigo-400',  bgCls: 'bg-indigo-50/60'  },
  { id: 'submitted',   label: 'Submitted',     icon: '📤', headerCls: 'border-t-violet-400',  bgCls: 'bg-violet-50/60'  },
  { id: 'shortlisted', label: 'Shortlisted',   icon: '⭐', headerCls: 'border-t-blue-400',    bgCls: 'bg-blue-50/60'    },
  { id: 'won',         label: 'Won / Done',    icon: '🏆', headerCls: 'border-t-amber-400',   bgCls: 'bg-amber-50/60'   },
];

// ── KanbanBoard ────────────────────────────────────────────────

const KanbanBoard = ({ hackathons, onDragEnd, onCardClick }) => {
  // Bucket hackathons into columns by status
  const byColumn = (colId) =>
    hackathons.filter(h => (h.status || 'registered') === colId);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const cards = byColumn(col.id);
          return (
            <div key={col.id} className="flex flex-col min-h-[400px]">
              {/* Column header */}
              <div className={`bg-white rounded-t-xl border border-b-0 border-gray-200
                              border-t-4 ${col.headerCls} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.icon}</span>
                  <span className="text-sm font-bold text-gray-800">{col.label}</span>
                </div>
                <span className="text-xs font-black bg-gray-100 text-gray-600 w-6 h-6
                                 rounded-full flex items-center justify-center">
                  {cards.length}
                </span>
              </div>

              {/* Drop zone */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-b-xl border border-gray-200 p-3 flex flex-col gap-3
                      transition-colors duration-200
                      ${snapshot.isDraggingOver ? 'bg-indigo-50 border-indigo-300' : col.bgCls}`}
                  >
                    {cards.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-xs text-gray-400 font-medium text-center px-4">
                          {snapshot.isDraggingOver ? 'Drop here' : 'Drag cards here'}
                        </p>
                      </div>
                    ) : (
                      cards.map((hack, idx) => (
                        <KanbanCard
                          key={hack._id}
                          hackathon={hack}
                          index={idx}
                          onClick={onCardClick}
                        />
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
