import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const TABS = ['Dashboard', 'All Tutors', 'Pending Approvals', 'Pending Payments', 'Payment History', 'Students & Leads'];

const StatCard = ({ label, value, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

const Badge = ({ status }) => {
    const map = {
        pending: 'bg-yellow-100 text-yellow-700',
        verified: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        open: 'bg-blue-100 text-blue-700',
    };
    return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

// ─── Reject Modal (tutor rejection with reason) ───────────────────────────────
const RejectModal = ({ tutorName, onConfirm, onClose }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const QUICK_REASONS = [
        'Incomplete profile information',
        'Invalid or unreadable CNIC',
        'Unverifiable qualifications',
        'Teaching areas not currently served',
        'Duplicate application',
    ];

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm(reason.trim() || 'No reason provided.');
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">×</button>
                <h3 className="text-base font-bold text-gray-800 mb-1">Reject Application</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Rejecting <strong>{tutorName}</strong>. Please provide a reason — the tutor will see this.
                </p>

                <div className="mb-3 space-y-1">
                    {QUICK_REASONS.map(r => (
                        <button
                            key={r}
                            onClick={() => setReason(r)}
                            className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition ${reason === r ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-4"
                    rows={3}
                    placeholder="Or type a custom reason..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                />

                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-60"
                    >
                        {loading ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
const DashboardTab = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/stats')
            .then(r => setStats(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-gray-500 py-8">Loading stats...</p>;
    if (!stats) return <p className="text-red-500 py-8">Failed to load stats.</p>;

    return (
        <div>
            <h2 className="text-base font-semibold text-gray-700 mb-4">Live Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <StatCard label="Total Tutors" value={stats.totalTutors} color="text-gray-800" />
                <StatCard label="Pending Approvals" value={stats.pendingTutors} color="text-yellow-600" />
                <StatCard label="Total Leads" value={stats.totalLeads} color="text-gray-800" />
                <StatCard label="Open Leads" value={stats.openLeads} color="text-blue-600" />
                <StatCard label="Verified Payments" value={stats.verifiedPayments} color="text-green-600" />
                <StatCard label="Pending Payments" value={stats.pendingPayments} color="text-yellow-600" />
                <StatCard label="Total Revenue" value={`Rs. ${stats.totalRevenue?.toLocaleString()}`} color="text-green-700" />
            </div>
        </div>
    );
};

// ─── All Tutors Tab ───────────────────────────────────────────────────────────
const AllTutorsTab = () => {
    const navigate = useNavigate();
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(null);
    const [search, setSearch] = useState('');
    const [rejectTarget, setRejectTarget] = useState(null); // { id, name }

    const fetchTutors = () => {
        setLoading(true);
        api.get('/admin/all-tutors')
            .then(r => setTutors(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(fetchTutors, []);

    const handleApprove = async (id) => {
        setActing(id);
        try {
            await api.post(`/admin/approve-tutor/${id}`);
            setTutors(prev => prev.map(t => t._id === id ? { ...t, isVerified: true, status: 'verified' } : t));
        } catch (err) {
            alert(err.response?.data?.message || 'Error');
        }
        setActing(null);
    };

    const handleReject = async (reason) => {
        if (!rejectTarget) return;
        setActing(rejectTarget.id);
        try {
            await api.post(`/admin/reject-tutor/${rejectTarget.id}`, { reason });
            setTutors(prev => prev.map(t => t._id === rejectTarget.id ? { ...t, status: 'rejected', isVerified: false, rejectionReason: reason } : t));
        } catch (err) {
            alert(err.response?.data?.message || 'Error');
        }
        setActing(null);
        setRejectTarget(null);
    };

    const filtered = tutors.filter(t => {
        const q = search.toLowerCase();
        return !q || t.userId?.name?.toLowerCase().includes(q) || t.userId?.email?.toLowerCase().includes(q) || t.subjects?.some(s => s.toLowerCase().includes(q));
    });

    if (loading) return <p className="text-gray-500 py-8">Loading tutors...</p>;

    return (
        <div>
            {rejectTarget && (
                <RejectModal
                    tutorName={rejectTarget.name}
                    onConfirm={handleReject}
                    onClose={() => setRejectTarget(null)}
                />
            )}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">{tutors.length} tutor{tutors.length !== 1 ? 's' : ''} total</p>
                <input
                    type="text"
                    placeholder="Search by name, email, subject..."
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-56"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-400">{search ? 'No tutors match your search.' : 'No tutors registered yet.'}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map(tutor => (
                        <div key={tutor._id} className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-base font-semibold text-gray-800">{tutor.userId?.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tutor.status === 'verified' ? 'bg-green-100 text-green-700' :
                                            tutor.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {tutor.status === 'verified' ? '✓ Verified' : tutor.status === 'rejected' ? '✗ Rejected' : 'Pending'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{tutor.userId?.email} · {tutor.userId?.phone}</p>
                                    <p className="text-sm text-gray-500">City: {tutor.userId?.city} · Exp: {tutor.experience} yr(s)</p>

                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {tutor.subjects?.map(s => (
                                            <span key={s} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Areas: {tutor.areas?.join(', ') || '—'} · Fee: Rs. {tutor.feeRange?.min}–{tutor.feeRange?.max}/mo
                                    </p>
                                    {tutor.status === 'rejected' && tutor.rejectionReason && (
                                        <p className="text-xs text-red-500 mt-1 italic">Reason: {tutor.rejectionReason}</p>
                                    )}
                                </div>

                                <div className="flex sm:flex-col gap-2 sm:min-w-[120px]">
                                    <button
                                        onClick={() => navigate(`/tutor/${tutor._id}`)}
                                        className="flex-1 sm:flex-none border border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
                                    >
                                        View Profile
                                    </button>
                                    {tutor.status !== 'verified' && (
                                        <button
                                            onClick={() => handleApprove(tutor._id)}
                                            disabled={acting === tutor._id}
                                            className="flex-1 sm:flex-none bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                                        >
                                            {acting === tutor._id ? '...' : '✓ Approve'}
                                        </button>
                                    )}
                                    {tutor.status !== 'rejected' && (
                                        <button
                                            onClick={() => setRejectTarget({ id: tutor._id, name: tutor.userId?.name })}
                                            disabled={acting === tutor._id}
                                            className="flex-1 sm:flex-none bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm disabled:opacity-50"
                                        >
                                            {acting === tutor._id ? '...' : '✗ Reject'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Pending Approvals Tab ────────────────────────────────────────────────────
const PendingApprovalsTab = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);

    const fetchTutors = () => {
        setLoading(true);
        api.get('/admin/pending-tutors')
            .then(r => setTutors(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(fetchTutors, []);

    const handleApprove = async (id) => {
        setActing(id);
        try {
            await api.post(`/admin/approve-tutor/${id}`);
            setTutors(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Error approving tutor');
        }
        setActing(null);
    };

    const handleReject = async (reason) => {
        if (!rejectTarget) return;
        setActing(rejectTarget.id);
        try {
            await api.post(`/admin/reject-tutor/${rejectTarget.id}`, { reason });
            setTutors(prev => prev.filter(t => t._id !== rejectTarget.id));
        } catch (err) {
            alert(err.response?.data?.message || 'Error rejecting tutor');
        }
        setActing(null);
        setRejectTarget(null);
    };

    if (loading) return <p className="text-gray-500 py-8">Loading...</p>;

    if (tutors.length === 0) return (
        <div className="text-center py-16">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-gray-500">No pending approvals.</p>
        </div>
    );

    return (
        <div>
            {rejectTarget && (
                <RejectModal
                    tutorName={rejectTarget.name}
                    onConfirm={handleReject}
                    onClose={() => setRejectTarget(null)}
                />
            )}
            <div className="grid gap-4">
                {tutors.map(tutor => (
                    <div key={tutor._id} className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-semibold text-gray-800">{tutor.userId?.name}</h3>
                                    <Badge status="pending" />
                                </div>
                                <p className="text-sm text-gray-500">{tutor.userId?.email} · {tutor.userId?.phone}</p>
                                <p className="text-sm text-gray-500">City: {tutor.userId?.city} · Qualification: {tutor.qualification || '—'}</p>

                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {tutor.subjects?.map(s => (
                                        <span key={s} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                                    ))}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                    {tutor.boards?.map(b => (
                                        <span key={b} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{b}</span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Areas: {tutor.areas?.join(', ') || '—'} · Fee: Rs. {tutor.feeRange?.min}–{tutor.feeRange?.max}/mo
                                </p>
                                {tutor.cnic && <p className="text-xs text-gray-500 mt-1">CNIC: {tutor.cnic}</p>}
                                {tutor.bio && <p className="text-xs text-gray-400 mt-1 italic">"{tutor.bio}"</p>}
                                <p className="text-xs text-gray-400 mt-1">Registered: {new Date(tutor.userId?.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="flex sm:flex-col gap-2 sm:min-w-[120px]">
                                <button
                                    onClick={() => handleApprove(tutor._id)}
                                    disabled={acting === tutor._id}
                                    className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                                >
                                    {acting === tutor._id ? '...' : '✓ Approve'}
                                </button>
                                <button
                                    onClick={() => setRejectTarget({ id: tutor._id, name: tutor.userId?.name })}
                                    disabled={acting === tutor._id}
                                    className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm disabled:opacity-50"
                                >
                                    {acting === tutor._id ? '...' : '✗ Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Pending Payments Tab ─────────────────────────────────────────────────────
const PendingPaymentsTab = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(null);
    const [viewingImage, setViewingImage] = useState(null); // full-screen image viewer
    const [rejectTarget, setRejectTarget] = useState(null); // payment id awaiting reason

    const fetchPayments = () => {
        setLoading(true);
        api.get('/admin/pending-payments')
            .then(r => setPayments(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(fetchPayments, []);

    const handleVerify = async (id) => {
        setActing(id);
        try {
            await api.post(`/admin/verify-payment/${id}`);
            setPayments(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Error verifying payment');
        }
        setActing(null);
    };

    const handleReject = async (reason) => {
        if (!rejectTarget) return;
        setActing(rejectTarget);
        try {
            await api.post(`/admin/reject-payment/${rejectTarget}`, { reason });
            setPayments(prev => prev.filter(p => p._id !== rejectTarget));
        } catch (err) {
            alert(err.response?.data?.message || 'Error rejecting payment');
        }
        setActing(null);
        setRejectTarget(null);
    };

    if (loading) return <p className="text-gray-500 py-8">Loading...</p>;

    if (payments.length === 0) return (
        <div className="text-center py-16">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-gray-500">No pending payments to verify.</p>
        </div>
    );

    return (
        <>
            {/* Payment Rejection Reason Modal */}
            {rejectTarget && (
                <RejectModal
                    tutorName="this payment"
                    onConfirm={handleReject}
                    onClose={() => setRejectTarget(null)}
                />
            )}

            {/* Full-screen image viewer */}
            {viewingImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                    onClick={() => setViewingImage(null)}
                >
                    <div className="relative max-w-2xl w-full">
                        <button
                            className="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300"
                            onClick={() => setViewingImage(null)}
                        >×</button>
                        <img
                            src={viewingImage}
                            alt="Payment proof"
                            className="w-full rounded-xl shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        />
                        <p className="text-white text-xs text-center mt-2 opacity-60">Click outside to close</p>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {payments.map(payment => (
                    <div key={payment._id} className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-semibold text-gray-800">{payment.tutorId?.name}</h3>
                                    <Badge status="pending" />
                                </div>
                                <p className="text-sm text-gray-500">{payment.tutorId?.email} · {payment.tutorId?.phone}</p>

                                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                                    <div><span className="font-medium">Lead:</span> {payment.leadId?.subject} — {payment.leadId?.level}</div>
                                    <div><span className="font-medium">Board:</span> {payment.leadId?.board}</div>
                                    <div><span className="font-medium">Area:</span> {payment.leadId?.area}</div>
                                    <div><span className="font-medium">Amount:</span> Rs. {payment.amount}</div>
                                    <div><span className="font-medium">Method:</span> {payment.method}</div>
                                    {payment.transactionId && (
                                        <div><span className="font-medium">Txn ID:</span> <span className="font-mono">{payment.transactionId}</span></div>
                                    )}
                                </div>

                                {/* Payment Proof Screenshot */}
                                {payment.proofUrl ? (
                                    <div className="mt-3">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Payment Screenshot:</p>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={payment.proofUrl}
                                                alt="Payment proof"
                                                className="h-20 w-28 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                                                onClick={() => setViewingImage(payment.proofUrl)}
                                            />
                                            <button
                                                onClick={() => setViewingImage(payment.proofUrl)}
                                                className="text-sm text-green-600 hover:underline"
                                            >
                                                View Full Size
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700">
                                        ⚠️ No screenshot uploaded — verify Txn ID manually
                                    </div>
                                )}

                                <p className="text-xs text-gray-400 mt-2">Submitted: {new Date(payment.createdAt).toLocaleString()}</p>
                            </div>

                            <div className="flex sm:flex-col gap-2 sm:min-w-[130px]">
                                <button
                                    onClick={() => handleVerify(payment._id)}
                                    disabled={acting === payment._id}
                                    className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                                >
                                    {acting === payment._id ? '...' : '✓ Verify'}
                                </button>
                                <button
                                    onClick={() => setRejectTarget(payment._id)}
                                    disabled={acting === payment._id}
                                    className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm disabled:opacity-50"
                                >
                                    {acting === payment._id ? '...' : '✗ Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

// ─── Payment History Tab ──────────────────────────────────────────────────────
const PaymentHistoryTab = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | verified | rejected | pending
    const [viewingImage, setViewingImage] = useState(null);

    useEffect(() => {
        api.get('/admin/all-payments')
            .then(r => setPayments(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);

    const statusStyle = {
        verified: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        pending: 'bg-yellow-100 text-yellow-700',
    };

    const totalRevenue = payments
        .filter(p => p.status === 'verified')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    if (loading) return <p className="text-gray-500 py-8">Loading...</p>;

    return (
        <>
            {/* Full-screen image viewer */}
            {viewingImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setViewingImage(null)}>
                    <div className="relative max-w-2xl w-full">
                        <button className="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300" onClick={() => setViewingImage(null)}>×</button>
                        <img src={viewingImage} alt="Payment proof" className="w-full rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
                        <p className="text-white text-xs text-center mt-2 opacity-60">Click outside to close</p>
                    </div>
                </div>
            )}

            {/* Summary bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex gap-2">
                    {['all', 'verified', 'pending', 'rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${filter === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'}`}
                        >
                            {s === 'all' ? `All (${payments.length})` : `${s} (${payments.filter(p => p.status === s).length})`}
                        </button>
                    ))}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm font-semibold text-green-700">
                    💰 Total Revenue: Rs. {totalRevenue.toLocaleString()}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-gray-400">No {filter === 'all' ? '' : filter} payments yet.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filtered.map(payment => (
                        <div key={payment._id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${payment.status === 'verified' ? 'border-green-400' : payment.status === 'rejected' ? 'border-red-400' : 'border-yellow-400'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <p className="font-semibold text-gray-800">{payment.tutorId?.name}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[payment.status]}`}>
                                            {payment.status === 'verified' ? '✓ Verified' : payment.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{payment.tutorId?.email} · {payment.tutorId?.phone}</p>

                                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                                        <div><span className="font-medium">Lead:</span> {payment.leadId?.subject} — {payment.leadId?.level}</div>
                                        <div><span className="font-medium">Board:</span> {payment.leadId?.board}</div>
                                        <div><span className="font-medium">Area:</span> {payment.leadId?.area}</div>
                                        <div><span className="font-medium">Amount:</span> <span className="text-green-700 font-semibold">Rs. {payment.amount}</span></div>
                                        <div><span className="font-medium">Method:</span> {payment.method}</div>
                                        {payment.transactionId && (
                                            <div><span className="font-medium">Txn ID:</span> <span className="font-mono text-xs">{payment.transactionId}</span></div>
                                        )}
                                    </div>

                                    {/* Student info */}
                                    {payment.leadId?.studentName && (
                                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 inline-flex gap-3">
                                            <span>👤 {payment.leadId.studentName}</span>
                                            <span>📞 {payment.leadId.studentPhone}</span>
                                        </div>
                                    )}

                                    {/* Rejection reason */}
                                    {payment.status === 'rejected' && payment.rejectionReason && (
                                        <p className="mt-2 text-xs text-red-500 italic">Reason: {payment.rejectionReason}</p>
                                    )}

                                    {/* Verified by */}
                                    {payment.status === 'verified' && payment.verifiedBy && (
                                        <p className="mt-1 text-xs text-green-600">Verified by: {payment.verifiedBy.name}</p>
                                    )}

                                    <p className="text-xs text-gray-400 mt-2">Submitted: {new Date(payment.createdAt).toLocaleString()}</p>
                                </div>

                                {/* Screenshot thumbnail */}
                                {payment.proofUrl && (
                                    <div className="shrink-0">
                                        <p className="text-xs text-gray-400 mb-1">Screenshot:</p>
                                        <img
                                            src={payment.proofUrl}
                                            alt="Proof"
                                            className="h-20 w-28 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                                            onClick={() => setViewingImage(payment.proofUrl)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

// ─── Students & Leads Tab ─────────────────────────────────────────────────────
const StudentsTab = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        api.get('/admin/all-leads')
            .then(r => setLeads(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = leads.filter(l => {
        const q = search.toLowerCase();
        return !q || l.studentName?.toLowerCase().includes(q)
            || l.subject?.toLowerCase().includes(q)
            || l.area?.toLowerCase().includes(q)
            || l.studentPhone?.includes(q);
    });

    const statusColors = {
        open: 'bg-blue-100 text-blue-700',
        pending: 'bg-yellow-100 text-yellow-700',
        unlocked: 'bg-green-100 text-green-700',
        closed: 'bg-gray-100 text-gray-500',
        expired: 'bg-red-100 text-red-400',
    };
    const paymentColors = {
        pending: 'text-yellow-600',
        verified: 'text-green-600',
        rejected: 'text-red-500',
    };

    if (loading) return <p className="text-gray-500 py-8">Loading...</p>;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">{leads.length} total lead{leads.length !== 1 ? 's' : ''}</p>
                <input
                    type="text"
                    placeholder="Search by name, subject, area, phone..."
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-64"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-3">📋</div>
                    <p className="text-gray-400">{search ? 'No leads match your search.' : 'No leads yet.'}</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filtered.map(lead => (
                        <div key={lead._id} className="bg-white rounded-xl shadow-sm p-5">
                            {/* Lead header */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <p className="font-semibold text-gray-800">{lead.subject} — {lead.level}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {lead.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{lead.board} · {lead.area}</p>

                                    {/* Student contact — always visible to admin */}
                                    <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 inline-flex flex-col gap-0.5">
                                        <span>👤 <strong>Student:</strong> {lead.studentName}</span>
                                        <span>📞 <strong>Phone:</strong> {lead.studentPhone}</span>
                                    </div>

                                    <p className="text-xs text-gray-400 mt-2">
                                        Submitted: {new Date(lead.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Tutor count badge */}
                                <div className="shrink-0 text-right">
                                    <button
                                        onClick={() => setExpandedId(expandedId === lead._id ? null : lead._id)}
                                        className="text-sm text-green-600 hover:underline font-medium"
                                    >
                                        {lead.payments.length > 0
                                            ? `${lead.payments.length} tutor${lead.payments.length > 1 ? 's' : ''} interested ▾`
                                            : 'No tutors yet'}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded — assigned tutors list */}
                            {expandedId === lead._id && lead.payments.length > 0 && (
                                <div className="mt-4 border-t border-gray-100 pt-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tutors Who Paid for This Lead</p>
                                    <div className="grid gap-2">
                                        {lead.payments.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                                                <div>
                                                    <p className="font-medium text-gray-800">{p.tutorName}</p>
                                                    <p className="text-gray-500 text-xs">{p.tutorEmail} · {p.tutorPhone}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-xs font-semibold ${paymentColors[p.status] || 'text-gray-500'}`}>
                                                        {p.status === 'verified' ? '✓ Verified' : p.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{p.method} · Rs. {p.amount}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main AdminPanel ──────────────────────────────────────────────────────────
const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('Dashboard');

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar adminMode />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                    <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">Admin Only</span>
                </div>

                {/* Tab bar */}
                <div className="flex flex-wrap gap-1 bg-white rounded-xl shadow-sm p-1 mb-6 w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-green-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Dashboard' && <DashboardTab />}
                {activeTab === 'All Tutors' && <AllTutorsTab />}
                {activeTab === 'Pending Approvals' && <PendingApprovalsTab />}
                {activeTab === 'Pending Payments' && <PendingPaymentsTab />}
                {activeTab === 'Payment History' && <PaymentHistoryTab />}
                {activeTab === 'Students & Leads' && <StudentsTab />}
            </div>
        </div>
    );
};

export default AdminPanel;