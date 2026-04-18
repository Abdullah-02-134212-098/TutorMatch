import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Request Modal ─────────────────────────────────────────────────────────────
const RequestModal = ({ tutor, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        studentName: '',
        studentPhone: '',
        subject: tutor.subjects?.[0] || '',
        board: tutor.boards?.[0] || 'Sindh',
        level: tutor.levels?.[0] || 'Class 10',
        area: tutor.areas?.[0] || '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        if (!form.studentName || !form.studentPhone || !form.subject || !form.area) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/leads', form);
            setDone(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit request.');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
                >×</button>

                {done ? (
                    <div className="text-center py-6">
                        <div className="text-5xl mb-3">✅</div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Request Sent!</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Tutors in your area will reach out to you soon.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Request This Tutor</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Fill in your details and we'll connect you with <strong>{tutor.userId?.name}</strong>.
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        {!user && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-2.5 rounded-lg mb-4 text-sm">
                                You need to <button onClick={() => navigate('/login')} className="underline font-medium">log in</button> to send a request.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Your Name *</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                    placeholder="e.g. Ahmed Khan"
                                    value={form.studentName}
                                    onChange={e => setForm({ ...form, studentName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                    placeholder="e.g. 03001234567"
                                    value={form.studentPhone}
                                    onChange={e => setForm({ ...form, studentPhone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                >
                                    {tutor.subjects?.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Board</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                        value={form.board}
                                        onChange={e => setForm({ ...form, board: e.target.value })}
                                    >
                                        {(tutor.boards?.length ? tutor.boards : ['Sindh', 'Federal', 'O Level', 'A Level']).map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                        value={form.level}
                                        onChange={e => setForm({ ...form, level: e.target.value })}
                                    >
                                        {(tutor.levels?.length ? tutor.levels : ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'O Level', 'A Level']).map(l => <option key={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Your Area *</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                    value={form.area}
                                    onChange={e => setForm({ ...form, area: e.target.value })}
                                >
                                    <option value="">Select area...</option>
                                    {tutor.areas?.map(a => <option key={a}>{a}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Additional Notes</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                                    rows={3}
                                    placeholder="e.g. Need help with past papers, prefer evening sessions..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !user}
                                className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-60 mt-1"
                            >
                                {loading ? 'Sending...' : 'Send Request'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

// ── Badge helpers ─────────────────────────────────────────────────────────────
const Badge = ({ children, color = 'gray' }) => {
    const colors = {
        gray: 'bg-gray-100 text-gray-600',
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700',
    };
    return (
        <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${colors[color]}`}>
            {children}
        </span>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const TutorPublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [showRequest, setShowRequest] = useState(false);

    useEffect(() => {
        api.get(`/tutors/${id}`)
            .then(r => setTutor(r.data))
            .catch(err => {
                if (err.response?.status === 404) setNotFound(true);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
                    <div className="bg-white rounded-xl p-6 flex gap-5">
                        <div className="w-20 h-20 bg-gray-200 rounded-full shrink-0" />
                        <div className="flex-1 space-y-3 pt-2">
                            <div className="h-5 bg-gray-200 rounded w-1/3" />
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 h-32 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    if (notFound || !tutor) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-xl mx-auto px-4 py-20 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Tutor Not Found</h2>
                    <p className="text-gray-500 mb-6">This profile doesn't exist or may have been removed.</p>
                    <button
                        onClick={() => navigate('/search')}
                        className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium"
                    >
                        Browse Tutors
                    </button>
                </div>
            </div>
        );
    }

    const name = tutor.userId?.name || 'Tutor';
    const initial = name.charAt(0).toUpperCase();
    const modeLabel = { home: 'Home Visits', online: 'Online Only', both: 'Home & Online' };

    return (
        <>
            {showRequest && <RequestModal tutor={tutor} onClose={() => setShowRequest(false)} />}

            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

                    {/* ── Back button ── */}
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-500 hover:text-green-600 text-sm flex items-center gap-1"
                    >
                        ← Back
                    </button>

                    {/* ── Header Card ── */}
                    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row gap-5">
                        {/* Avatar */}
                        {tutor.photo ? (
                            <img
                                src={tutor.photo}
                                alt={name}
                                className="w-20 h-20 rounded-full object-cover shrink-0"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-3xl shrink-0">
                                {initial}
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-xl font-bold text-gray-800">{name}</h1>
                                {tutor.isVerified && (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                        ✓ Verified
                                    </span>
                                )}
                                {tutor.featured && (
                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                        ⭐ Featured
                                    </span>
                                )}
                            </div>

                            {tutor.qualification && (
                                <p className="text-gray-600 text-sm mb-1">{tutor.qualification}</p>
                            )}

                            <p className="text-gray-500 text-sm mb-3">
                                📍 {tutor.userId?.city || 'Karachi'} &nbsp;·&nbsp;
                                {tutor.experience > 0 ? `${tutor.experience} yr${tutor.experience > 1 ? 's' : ''} exp` : 'New tutor'} &nbsp;·&nbsp;
                                {modeLabel[tutor.teachingMode] || 'Home Visits'}
                            </p>

                            {tutor.rating > 0 && (
                                <p className="text-sm text-yellow-600 mb-3">
                                    ⭐ {tutor.rating.toFixed(1)} ({tutor.totalReviews} review{tutor.totalReviews !== 1 ? 's' : ''})
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-green-700 font-semibold text-sm">
                                    Rs. {tutor.feeRange?.min?.toLocaleString()} – {tutor.feeRange?.max?.toLocaleString()}/month
                                </span>
                                <button
                                    onClick={() => setShowRequest(true)}
                                    className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition"
                                >
                                    Request This Tutor
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Bio ── */}
                    {tutor.bio && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="font-semibold text-gray-800 mb-2">About</h2>
                            <p className="text-gray-600 text-sm leading-relaxed">{tutor.bio}</p>
                        </div>
                    )}

                    {/* ── Subjects, Boards, Levels ── */}
                    <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Subjects</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {tutor.subjects?.map(s => <Badge key={s} color="green">{s}</Badge>)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Boards</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {tutor.boards?.map(b => <Badge key={b} color="blue">{b}</Badge>)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Levels</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {tutor.levels?.map(l => <Badge key={l} color="purple">{l}</Badge>)}
                            </div>
                        </div>
                    </div>

                    {/* ── Areas ── */}
                    {tutor.areas?.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="font-semibold text-gray-800 mb-2">Teaching Areas</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {tutor.areas.map(a => (
                                    <Badge key={a}>📍 {a}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── CTA Banner ── */}
                    <div className="bg-green-600 rounded-xl p-6 text-white text-center">
                        <p className="font-semibold text-lg mb-1">Interested in {name.split(' ')[0]}?</p>
                        <p className="text-green-100 text-sm mb-4">Send a request — it's free and takes 30 seconds.</p>
                        <button
                            onClick={() => setShowRequest(true)}
                            className="bg-white text-green-700 font-medium px-6 py-2 rounded-lg hover:bg-green-50 transition text-sm"
                        >
                            Send Request Now
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default TutorPublicProfile;