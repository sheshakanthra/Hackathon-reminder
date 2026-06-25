import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getHackathons, updateHackathon } from '../services/localStorage';

const EditHackathon = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [regDate, setRegDate] = useState('');
    const [pptDate, setPptDate] = useState('');
    const [includePpt, setIncludePpt] = useState(true);
    const [location, setLocation] = useState('');
    const [prize, setPrize] = useState('');
    const [teamSize, setTeamSize] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Web Development');
    const [priority, setPriority] = useState('Medium');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().slice(0, 16);
    };

    useEffect(() => {
        const fetchHackathon = async () => {
            try {
                const data = getHackathons();
                const hackathon = data.find(h => h._id === id);
                if (hackathon) {
                    setName(hackathon.name);
                    setRegDate(formatDateForInput(hackathon.registrationDeadline));
                    setPptDate(formatDateForInput(hackathon.pptDeadline));
                    setLocation(hackathon.location || '');
                    setPrize(hackathon.prize || '');
                    setTeamSize(hackathon.teamSize || '');
                    setDescription(hackathon.description || '');
                    setCategory(hackathon.category || 'Web Development');
                    setPriority(hackathon.priority || 'Medium');
                    setNotificationsEnabled(false);
                    setIncludePpt(!!hackathon.pptDeadline);
                } else {
                    setError('Hackathon not found');
                }
            } catch (e) {
                setError('Failed to fetch hackathon details');
            } finally {
                setLoading(false);
            }
        };
        fetchHackathon();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            const payload = {
                name,
                registrationDeadline: regDate,
                location: location || 'Online',
                prize: prize || 'TBD',
                teamSize: teamSize || 'Any',
                description: description || '',
                category: category || 'Web Development',
                priority: priority || 'Medium',
                notificationsEnabled: false
            };

            if (includePpt && pptDate) {
                payload.pptDeadline = pptDate;
            } else {
                payload.pptDeadline = new Date(new Date(regDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            }

            updateHackathon(id, payload);
            setSuccessMessage('Hackathon updated successfully! Redirecting...');
            setTimeout(() => navigate('/'), 1500);
        } catch (e) {
            console.error(e);
            setError('Failed to update hackathon. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex justify-center items-center">
            <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Event Details...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <Link
                            to="/"
                            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mb-4 group"
                        >
                            <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2 / 1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                            Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Reminder</span>
                        </h1>
                        <p className="text-slate-500 text-lg mt-3 font-medium">Update the details for "{name}".</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-200/50 border border-white overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-slate-100">

                        {/* Status Messages */}
                        {(error || successMessage) && (
                            <div className="px-8 py-6">
                                {error && (
                                    <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 text-red-800 px-6 py-4 rounded-2xl flex items-center animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="bg-red-500 rounded-full p-1 mr-4 shadow-lg shadow-red-200">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <span className="font-semibold">{error}</span>
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="bg-emerald-50/50 backdrop-blur-sm border border-emerald-100 text-emerald-800 px-6 py-4 rounded-2xl flex flex-col md:flex-row items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300 gap-4">
                                        <div className="flex items-center">
                                            <div className="bg-emerald-500 rounded-full p-1 mr-4 shadow-lg shadow-emerald-200">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="font-bold">{successMessage}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Grid Context */}
                        <div className="grid grid-cols-1 lg:grid-cols-2">

                            {/* Left Column: Basic Info */}
                            <div className="p-8 lg:p-10 space-y-8 border-r border-slate-100">
                                <section>
                                    <div className="flex items-center mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-bold">1</div>
                                        <h2 className="text-xl font-bold text-slate-800">Event Details</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="group">
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Hackathon Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 ring-1 ring-slate-200 text-slate-900 font-semibold placeholder:text-slate-300 transition-all outline-none"
                                                placeholder="Enter hackathon name..."
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Location</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 ring-1 ring-slate-200 text-slate-900 font-semibold placeholder:text-slate-300 transition-all outline-none"
                                                    placeholder="Online / City"
                                                    value={location}
                                                    onChange={e => setLocation(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Prize Pool</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 ring-1 ring-slate-200 text-slate-900 font-semibold placeholder:text-slate-300 transition-all outline-none"
                                                    placeholder="e.g. $5k"
                                                    value={prize}
                                                    onChange={e => setPrize(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Description</label>
                                            <textarea
                                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 ring-1 ring-slate-200 text-slate-900 font-semibold placeholder:text-slate-300 transition-all outline-none resize-none"
                                                rows="3"
                                                placeholder="Paste hackathon link or details..."
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mr-3 font-bold">2</div>
                                        <h2 className="text-xl font-bold text-slate-800">Classification</h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Category</label>
                                            <select
                                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 ring-1 ring-slate-200 text-slate-900 font-semibold appearance-none outline-none"
                                                value={category}
                                                onChange={e => setCategory(e.target.value)}
                                            >
                                                <option>Web Development</option>
                                                <option>Mobile Development</option>
                                                <option>Machine Learning</option>
                                                <option>AI/LLM</option>
                                                <option>Blockchain</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Priority</label>
                                            <select
                                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 ring-1 ring-slate-200 text-slate-900 font-bold appearance-none outline-none"
                                                value={priority}
                                                onChange={e => setPriority(e.target.value)}
                                            >
                                                <option className="text-blue-600">Low</option>
                                                <option className="text-emerald-600">Medium</option>
                                                <option className="text-orange-600">High</option>
                                                <option className="text-red-600">Critical</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Column: Deadlines & Auth */}
                            <div className="p-8 lg:p-10 space-y-10 bg-slate-50/50">
                                <section>
                                    <div className="flex items-center mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 font-bold">3</div>
                                        <h2 className="text-xl font-bold text-slate-800">Deadlines</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="relative group">
                                            <label className="block text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 px-1">Registration Closes *</label>
                                            <input
                                                type="datetime-local"
                                                required
                                                className="w-full px-5 py-3.5 bg-white border-0 rounded-2xl focus:ring-2 focus:ring-emerald-500 ring-1 ring-slate-200 text-slate-900 font-bold outline-none shadow-sm transition-all"
                                                value={regDate}
                                                onChange={e => setRegDate(e.target.value)}
                                            />

                                            {/* Time Presets */}
                                            <div className="mt-3 flex flex-wrap gap-2 px-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase self-center mr-1">Presets:</span>
                                                {[
                                                    { label: '00:00', time: '00:00' },
                                                    { label: '09:00', time: '09:00' },
                                                    { label: '21:00', time: '21:00' },
                                                    { label: '23:59', time: '23:59' }
                                                ].map((preset) => (
                                                    <button
                                                        key={preset.label}
                                                        type="button"
                                                        onClick={() => {
                                                            const date = regDate ? regDate.split('T')[0] : new Date().toISOString().split('T')[0];
                                                            setRegDate(`${date}T${preset.time}`);
                                                        }}
                                                        className="px-3 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 rounded-lg text-[10px] font-bold transition-colors border border-slate-200 hover:border-emerald-200"
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={`p-6 rounded-3xl transition-all duration-500 ${includePpt ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-200 opacity-60'}`}>
                                            <div className="flex items-center justify-between pointer-events-auto cursor-pointer" onClick={() => setIncludePpt(!includePpt)}>
                                                <div>
                                                    <h3 className="font-bold">PPT/Submission Phase</h3>
                                                    <p className={`text-xs mt-1 ${includePpt ? 'text-indigo-100' : 'text-slate-400'}`}>Track the final submission date separately</p>
                                                </div>
                                                <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${includePpt ? 'bg-indigo-400' : 'bg-slate-200'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${includePpt ? 'left-7' : 'left-1'}`} />
                                                </div>
                                            </div>

                                            {includePpt && (
                                                <div className="mt-6 pt-6 border-t border-indigo-500 animate-in fade-in zoom-in-95 duration-300 focus-within:scale-[1.02] transition-transform">
                                                    <label className="block text-xs font-black uppercase tracking-widest mb-2 px-1 text-white/80">Submission Deadline</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full px-5 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-bold outline-none placeholder:text-white/50"
                                                        value={pptDate}
                                                        onChange={e => setPptDate(e.target.value)}
                                                    />

                                                    {/* Time Presets */}
                                                    <div className="mt-3 flex flex-wrap gap-2 px-1">
                                                        {[
                                                            { label: '00:00', time: '00:00' },
                                                            { label: '09:00', time: '09:00' },
                                                            { label: '21:00', time: '21:00' },
                                                            { label: '23:59', time: '23:59' }
                                                        ].map((preset) => (
                                                            <button
                                                                key={preset.label}
                                                                type="button"
                                                                onClick={() => {
                                                                    const date = pptDate ? pptDate.split('T')[0] : (regDate ? regDate.split('T')[0] : new Date().toISOString().split('T')[0]);
                                                                    setPptDate(`${date}T${preset.time}`);
                                                                }}
                                                                className="px-3 py-1 bg-white/10 hover:bg-white text-white/60 hover:text-indigo-600 rounded-lg text-[10px] font-bold transition-all border border-white/10 hover:border-white shadow-sm"
                                                            >
                                                                {preset.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section className="pt-4">
                                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-800">Reminders</h3>
                                                    <p className="text-[11px] text-slate-500 font-medium">Synced with your Google account</p>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        </div>
                                    </div>
                                </section>

                                {/* Footer Actions */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-10">
                                    <Link
                                        to="/"
                                        className="flex-1 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition shadow-sm text-center"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] relative overflow-hidden group px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition disabled:bg-slate-300 shadow-xl shadow-indigo-200 disabled:shadow-none"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <span className="relative flex items-center justify-center">
                                            {saving ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    Save Changes
                                                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditHackathon;
