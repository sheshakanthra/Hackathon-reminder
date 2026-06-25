import { useEffect, useState, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getHackathons, deleteHackathon } from '../services/hackathons';
import HackathonCard from '../components/HackathonCard';
import ConfirmModal from '../components/ConfirmModal';
import UrlExtractBar from '../components/UrlExtractBar';

// ── Toast system ───────────────────────────────────────────────

const ToastContainer = ({ toasts, onDismiss }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold
          transition-all duration-300
          ${t.type === 'success'
            ? 'bg-emerald-500 text-white shadow-emerald-200'
            : 'bg-red-500 text-white shadow-red-200'
          }`}
      >
        <span>{t.type === 'success' ? '✓' : '✕'}</span>
        <span className="flex-1">{t.message}</span>
        <button onClick={() => onDismiss(t.id)}
                className="ml-1 opacity-70 hover:opacity-100 font-bold" aria-label="Dismiss">×</button>
      </div>
    ))}
  </div>
);

// ── Dashboard ──────────────────────────────────────────────────

const Dashboard = () => {
  const { user }                                    = useContext(AuthContext);
  const [hackathons,         setHackathons]         = useState([]);
  const [filteredHackathons, setFilteredHackathons] = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [filterType,         setFilterType]         = useState('active');
  const [searchTerm,         setSearchTerm]         = useState('');
  const [sortBy,             setSortBy]             = useState('deadline');
  const [isDeleteModalOpen,  setIsDeleteModalOpen]  = useState(false);
  const [deleteTargetId,     setDeleteTargetId]     = useState(null);
  const [toasts,             setToasts]             = useState([]);

  // ── Toast helpers ────────────────────────────────────────────

  const showToast = useCallback(({ type, message }) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Data loading (Supabase) ───────────────────────────────────

  const loadHackathons = useCallback(async () => {
    try {
      const data = await getHackathons();
      setHackathons(data);
    } catch (err) {
      console.error('[Dashboard] Failed to load:', err);
      showToast({ type: 'error', message: 'Failed to load hackathons: ' + err.message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadHackathons(); }, [loadHackathons]);

  // ── Filtering / sorting ──────────────────────────────────────

  const applyFilters = useCallback((hacks, type, search, sort) => {
    let filtered = [...hacks];
    const now = new Date();

    if (type === 'active') {
      filtered = filtered.filter(h => new Date(h.registration_deadline || h.registrationDeadline) > now);
    } else if (type === 'completed') {
      filtered = filtered.filter(h => new Date(h.registration_deadline || h.registrationDeadline) <= now);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(h =>
        h.name?.toLowerCase().includes(q) ||
        h.category?.toLowerCase().includes(q)
      );
    }

    if (sort === 'deadline') {
      filtered.sort((a, b) =>
        new Date(a.registration_deadline || a.registrationDeadline) -
        new Date(b.registration_deadline || b.registrationDeadline)
      );
    } else if (sort === 'priority') {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      filtered.sort((a, b) => (order[a.priority] ?? 999) - (order[b.priority] ?? 999));
    } else if (sort === 'name') {
      filtered.sort((a, b) => a.name?.localeCompare(b.name));
    }

    setFilteredHackathons(filtered);
  }, []);

  useEffect(() => {
    applyFilters(hackathons, filterType, searchTerm, sortBy);
  }, [filterType, searchTerm, sortBy, hackathons, applyFilters]);

  // ── Delete ───────────────────────────────────────────────────

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteHackathon(deleteTargetId);
      setHackathons(prev => prev.filter(h => h._id !== deleteTargetId && h.id !== deleteTargetId));
      showToast({ type: 'success', message: 'Hackathon deleted.' });
    } catch (e) {
      console.error('[Dashboard] Delete failed:', e);
      showToast({ type: 'error', message: 'Failed to delete: ' + e.message });
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  // ── Stats ────────────────────────────────────────────────────

  const now = new Date();
  const activeCount      = hackathons.filter(h => new Date(h.registration_deadline || h.registrationDeadline) > now).length;
  const shortlistedCount = hackathons.filter(h => h.status === 'shortlisted').length;
  const winsCount        = hackathons.filter(h => h.status === 'won').length;

  // ── Loading state ─────────────────────────────────────────────

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading your hackathons…</p>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── URL Auto-fill Bar ─────────────────────────────────── */}
      <UrlExtractBar onToast={showToast} />

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, <span className="font-semibold text-indigo-600">{user?.name}</span>
            </p>
          </div>
          <Link to="/add"
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Add Hackathon</span>
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{hackathons.length}</p>
              </div>
              <svg className="h-12 w-12 text-indigo-600 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
              </div>
              <svg className="h-12 w-12 text-green-600 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Shortlisted</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{shortlistedCount}</p>
              </div>
              <svg className="h-12 w-12 text-blue-500 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg shadow p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-700 text-sm font-medium">Wins</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{winsCount}</p>
              </div>
              <span className="text-5xl opacity-25 select-none">🏆</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input type="text" placeholder="Name or category…" value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="active">Active Only</option>
              <option value="completed">Completed</option>
              <option value="all">All</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="deadline">Deadline (Nearest)</option>
              <option value="priority">Priority</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setSearchTerm(''); setFilterType('active'); setSortBy('deadline'); }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Hackathon Grid ────────────────────────────────────── */}
      {filteredHackathons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border-2 border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No hackathons found</h3>
          <p className="mt-1 text-gray-500">Paste a URL above or click Add Hackathon to get started</p>
          <Link to="/add" className="mt-6 inline-block text-indigo-600 font-medium hover:text-indigo-500">
            Create a new hackathon &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map(h => (
            <HackathonCard key={h.id || h._id} hackathon={h} onDelete={handleDeleteClick} />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Hackathon?"
        message="This will permanently delete the hackathon from your Supabase database and cannot be undone."
        confirmText="Yes, Delete it"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        type="danger"
      />

      <div className="mt-8 text-center text-gray-600 text-sm">
        Showing {filteredHackathons.length} of {hackathons.length} hackathons
      </div>
    </div>
  );
};

export default Dashboard;
