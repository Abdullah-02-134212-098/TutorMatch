import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const TABS = ['Dashboard', 'Pending Tutors', 'Pending Payments'];

const StatCard = ({ label, value, color }) => (
    <div className="bg-white rounded-lg shadow p-5">
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
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <StatCard label="Total Tutors" value={stats.totalTutors} color="text-gray-800" />
                <StatCard label="Pending Approvals" value={stats.pendingTutors} color="text-yellow-600" />
                <StatCard label="Total Leads" value={stats.totalLeads} color="text-gray-800" />
                <StatCard label="Open Leads" value={stats.openLeads} color="text-blue-600" />
                <StatCard label="Payments Verified" value={stats.verifiedPayments} color="text-green-600" />
                <StatCard label="Pending Payments" value={stats.pendingPayments} color="text-yellow-600" />
                <StatCard
                    label="Total Revenue"
                    value={`Rs. ${stats.totalRevenue?.toLocaleString()}`}
                    color="text-green-700"
                />
            </div>
        </div>
    );
};

// ─── Pending Tutors Tab ───────────────────────────────────────────────────────
const PendingTutorsTab = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(null); // tutorId being actioned

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

    const handleReject = async (id) => {
        if (!confirm('Reject this tutor application?')) return;
        setActing(id);
        try {
            await api.post(`/admin/reject-tutor/${id}`);
            setTutors(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Error rejecting tutor');
        }
        setActing(null);
    };

    if (loading) return <p className="text-gray-500 py-8">Loading pending tutors...</p>;

    if (tutors.length === 0) return (
        <div className="text-center py-16">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-gray-500">No pending tutor applications.</p>
        </div>
    );

    return (
        <div className="grid gap-4">
            {tutors.map(tutor => (
                <div key={tutor._id} className="bg-white rounded-lg shadow p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {tutor.userId?.name}
                                </h3>
                                <Badge status="pending" />
                            </div>
                            <p className="text-sm text-gray-500">{tutor.userId?.email} · {tutor.userId?.phone}</p>
                            <p className="text-sm text-gray-500">City: {tutor.userId?.city}</p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {tutor.subjects?.map(s => (
                                    <span key={s} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                                        {s}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {tutor.boards?.map(b => (
                                    <span key={b} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                                        {b}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Areas:</span>{' '}
                                {tutor.areas?.join(', ') || '—'}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Fee range:</span>{' '}
                                Rs. {tutor.feeRange?.min} – {tutor.feeRange?.max}/month
                            </div>
                            {tutor.cnic && (
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">CNIC:</span> {tutor.cnic}
                                </div>
                            )}
                            {tutor.bio && (
                                <p className="mt-2 text-sm text-gray-500 italic">"{tutor.bio}"</p>
                            )}
                            <p className="mt-2 text-xs text-gray-400">
                                Applied: {new Date(tutor.userId?.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex sm:flex-col gap-2 sm:min-w-[120px]">
                            <button
                                onClick={() => handleApprove(tutor._id)}
                                disabled={acting === tutor._id}
                                className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm disabled:opacity-50"
                            >
                                {acting === tutor._id ? '...' : '✓ Approve'}
                            </button>
                            <button
                                onClick={() => handleReject(tutor._id)}
                                disabled={acting === tutor._id}
                                className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm disabled:opacity-50"
                            >
                                {acting === tutor._id ? '...' : '✗ Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Pending Payments Tab ─────────────────────────────────────────────────────
const PendingPaymentsTab = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(null);

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

    const handleReject = async (id) => {
        if (!confirm('Reject this payment?')) return;
        setActing(id);
        try {
            await api.post(`/admin/reject-payment/${id}`);
            setPayments(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Error rejecting payment');
        }
        setActing(null);
    };

    if (loading) return <p className="text-gray-500 py-8">Loading pending payments...</p>;

    if (payments.length === 0) return (
        <div className="text-center py-16">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-gray-500">No pending payments to verify.</p>
        </div>
    );

    return (
        <div className="grid gap-4">
            {payments.map(payment => (
                <div key={payment._id} className="bg-white rounded-lg shadow p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {payment.tutorId?.name}
                                </h3>
                                <Badge status="pending" />
                            </div>
                            <p className="text-sm text-gray-500">
                                {payment.tutorId?.email} · {payment.tutorId?.phone}
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">Lead:</span>{' '}
                                    {payment.leadId?.subject} — {payment.leadId?.level}
                                </div>
                                <div>
                                    <span className="font-medium">Board:</span>{' '}
                                    {payment.leadId?.board}
                                </div>
                                <div>
                                    <span className="font-medium">Area:</span>{' '}
                                    {payment.leadId?.area}
                                </div>
                                <div>
                                    <span className="font-medium">Amount:</span>{' '}
                                    Rs. {payment.amount}
                                </div>
                                <div>
                                    <span className="font-medium">Method:</span>{' '}
                                    {payment.method}
                                </div>
                                {payment.transactionId && (
                                    <div>
                                        <span className="font-medium">Txn ID:</span>{' '}
                                        {payment.transactionId}
                                    </div>
                                )}
                            </div>

                            {payment.proofUrl && (
                                <div className="mt-3">
                                    <a
                                        href={payment.proofUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                    >
                                        📎 View Payment Screenshot
                                    </a>
                                </div>
                            )}

                            <p className="mt-2 text-xs text-gray-400">
                                Submitted: {new Date(payment.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <div className="flex sm:flex-col gap-2 sm:min-w-[130px]">
                            <button
                                onClick={() => handleVerify(payment._id)}
                                disabled={acting === payment._id}
                                className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm disabled:opacity-50"
                            >
                                {acting === payment._id ? '...' : '✓ Verify'}
                            </button>
                            <button
                                onClick={() => handleReject(payment._id)}
                                disabled={acting === payment._id}
                                className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm disabled:opacity-50"
                            >
                                {acting === payment._id ? '...' : '✗ Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Main AdminPanel ──────────────────────────────────────────────────────────
const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('Dashboard');

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-5xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                    <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
                        Admin Only
                    </span>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-white rounded-lg shadow p-1 mb-6 w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded text-sm font-medium transition ${activeTab === tab
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-600 hover:text-green-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {activeTab === 'Dashboard' && <DashboardTab />}
                {activeTab === 'Pending Tutors' && <PendingTutorsTab />}
                {activeTab === 'Pending Payments' && <PendingPaymentsTab />}
            </div>
        </div>
    );
};

export default AdminPanel;