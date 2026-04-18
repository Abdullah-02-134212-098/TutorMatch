import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ALL_SUBJECTS, BOARDS, LEVELS_BY_BOARD } from '../utils/boards';
import { KARACHI_AREAS } from '../utils/constants';

// ── Smart subject dropdown ────────────────────────────────────────────────────
const SubjectPicker = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value);

    const filtered = query.length < 1
        ? ALL_SUBJECTS.slice(0, 10)
        : ALL_SUBJECTS.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 10);

    const select = (s) => { onChange(s); setQuery(s); setOpen(false); };

    return (
        <div className="relative">
            <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. Mathematics, Physics..."
                value={query}
                onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
            />
            {open && filtered.length > 0 && (
                <ul className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filtered.map(s => (
                        <li
                            key={s}
                            onMouseDown={() => select(s)}
                            className="px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 cursor-pointer"
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ── Area picker with "Other" fallback ────────────────────────────────────────
const AreaPicker = ({ area, address, onAreaChange, onAddressChange }) => {
    const ALL_AREA_OPTIONS = [...KARACHI_AREAS, 'Lahore (All Areas)', 'Islamabad (All Areas)', 'Rawalpindi (All Areas)', 'Other'];

    return (
        <div className="space-y-2">
            <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                value={area}
                onChange={e => onAreaChange(e.target.value)}
            >
                <option value="">Select your area...</option>
                {ALL_AREA_OPTIONS.map(a => <option key={a}>{a}</option>)}
            </select>
            {area === 'Other' && (
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Enter your full address (street, block, etc.)"
                    value={address}
                    onChange={e => onAddressChange(e.target.value)}
                />
            )}
        </div>
    );
};

// ── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        open: 'bg-blue-100 text-blue-700',
        pending: 'bg-yellow-100 text-yellow-700',
        unlocked: 'bg-green-100 text-green-700',
        closed: 'bg-gray-100 text-gray-500',
        expired: 'bg-red-100 text-red-500',
    };
    const labels = {
        open: 'Open — Awaiting Tutors',
        pending: 'Payment Pending',
        unlocked: 'Tutor Found ✓',
        closed: 'Closed',
        expired: 'Expired',
    };
    return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
            {labels[status] || status}
        </span>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const StudentDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('new');
    const [profile, setProfile] = useState(null);
    const [myLeads, setMyLeads] = useState([]);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const [form, setForm] = useState({
        studentName: '',
        studentPhone: '',
        subject: '',
        board: 'Sindh',
        level: '',
        area: '',
        address: '',
        description: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDeleteLead = async (id) => {
        if (!window.confirm('Delete this request? This cannot be undone.')) return;
        setDeletingId(id);
        try {
            await api.delete(`/leads/${id}`);
            setMyLeads(prev => prev.filter(l => l._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete request');
        }
        setDeletingId(null);
    };

    // Fetch user profile to pre-fill name + phone
    useEffect(() => {
        api.get('/auth/me').then(r => {
            setProfile(r.data);
            setForm(f => ({
                ...f,
                studentName: r.data.name || '',
                studentPhone: r.data.phone || '',
            }));
        }).catch(() => { });

        api.get('/leads/my').then(r => setMyLeads(r.data)).catch(() => { }).finally(() => setLeadsLoading(false));
    }, []);

    // When board changes, reset level
    const handleBoardChange = (board) => {
        setForm(f => ({ ...f, board, level: '' }));
    };

    const levelOptions = LEVELS_BY_BOARD[form.board] || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject) { setError('Please select a subject.'); return; }
        if (!form.level) { setError('Please select a class level.'); return; }
        if (!form.area) { setError('Please select your area.'); return; }
        if (form.area === 'Other' && !form.address.trim()) { setError('Please enter your address.'); return; }

        setLoading(true);
        setError('');
        try {
            await api.post('/leads', form);
            setSubmitted(true);
            // Refresh my leads
            const r = await api.get('/leads/my');
            setMyLeads(r.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting request');
        }
        setLoading(false);
    };

    const resetForm = () => {
        setSubmitted(false);
        setForm(f => ({ ...f, subject: '', board: 'Sindh', level: '', area: '', address: '', description: '' }));
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Hi, {user?.name} 👋</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white rounded-lg shadow p-1 mb-6 w-fit">
                    {[['new', 'Request a Tutor'], ['my', 'My Requests']].map(([t, label]) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`px-4 py-2 rounded text-sm font-medium transition ${activeTab === t ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-green-600'}`}
                        >
                            {label}
                            {t === 'my' && myLeads.length > 0 && (
                                <span className="ml-1.5 bg-green-100 text-green-700 text-xs rounded-full px-1.5">{myLeads.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── New Request Tab ── */}
                {activeTab === 'new' && (
                    <>
                        {submitted ? (
                            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                                <div className="text-5xl mb-3">✅</div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
                                <p className="text-gray-500 text-sm mb-6">
                                    Verified tutors in your area will contact you on <strong>{form.studentPhone}</strong> soon.
                                </p>
                                <button
                                    onClick={resetForm}
                                    className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm"
                                >
                                    Submit Another Request
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="font-semibold text-gray-800 mb-4">Find Me a Tutor</h2>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Name — pre-filled, editable */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                            value={form.studentName}
                                            onChange={e => setForm({ ...form, studentName: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Phone — pre-filled from profile */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contact Number
                                            <span className="text-gray-400 font-normal ml-1 text-xs">(tutors will call this number)</span>
                                        </label>
                                        <input
                                            type="tel"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                            placeholder="03001234567"
                                            value={form.studentPhone}
                                            onChange={e => setForm({ ...form, studentPhone: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Subject — searchable dropdown */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                        <SubjectPicker
                                            value={form.subject}
                                            onChange={v => setForm({ ...form, subject: v })}
                                        />
                                    </div>

                                    {/* Board */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Education Board *</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                            value={form.board}
                                            onChange={e => handleBoardChange(e.target.value)}
                                        >
                                            {BOARDS.map(b => <option key={b}>{b}</option>)}
                                        </select>
                                    </div>

                                    {/* Level — dynamically filtered by board */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {form.board === 'University' ? 'Semester / Program *' : 'Class Level *'}
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                            value={form.level}
                                            onChange={e => setForm({ ...form, level: e.target.value })}
                                        >
                                            <option value="">
                                                {levelOptions.length === 0 ? 'Select board first' : 'Select level...'}
                                            </option>
                                            {levelOptions.map(l => <option key={l}>{l}</option>)}
                                        </select>
                                    </div>

                                    {/* Area */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Area *</label>
                                        <AreaPicker
                                            area={form.area}
                                            address={form.address}
                                            onAreaChange={v => setForm({ ...form, area: v })}
                                            onAddressChange={v => setForm({ ...form, address: v })}
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Additional Notes
                                            <span className="text-gray-400 font-normal ml-1 text-xs">(optional)</span>
                                        </label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                                            rows={3}
                                            placeholder="e.g. Need help with past papers, prefer female tutor, evening timings..."
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-60"
                                    >
                                        {loading ? 'Submitting...' : 'Find Me a Tutor →'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </>
                )}

                {/* ── My Requests Tab ── */}
                {activeTab === 'my' && (
                    <>
                        {leadsLoading ? (
                            <p className="text-gray-500 py-8">Loading your requests...</p>
                        ) : myLeads.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                                <div className="text-5xl mb-3">📋</div>
                                <p className="text-gray-500">You haven't submitted any tutor requests yet.</p>
                                <button
                                    onClick={() => setActiveTab('new')}
                                    className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                                >
                                    Request a Tutor
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myLeads.map(lead => (
                                    <div key={lead._id} className="bg-white rounded-xl shadow-sm p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">
                                                    {lead.subject} — {lead.level}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    {lead.board} · {lead.area}
                                                    {lead.address && ` (${lead.address})`}
                                                </p>
                                                {lead.description && (
                                                    <p className="text-xs text-gray-400 mt-1 italic">"{lead.description}"</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Submitted {new Date(lead.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <StatusBadge status={lead.status} />
                                                {lead.status === 'open' && (
                                                    <button
                                                        onClick={() => handleDeleteLead(lead._id)}
                                                        disabled={deletingId === lead._id}
                                                        className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                                                    >
                                                        {deletingId === lead._id ? 'Deleting...' : '🗑 Delete'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;