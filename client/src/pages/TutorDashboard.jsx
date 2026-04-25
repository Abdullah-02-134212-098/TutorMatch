import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

// ── Payment Modal ─────────────────────────────────────────────────────────────
const PaymentModal = ({ lead, onClose, onSuccess }) => {
    const [method, setMethod] = useState('jazzcash');
    const [txnId, setTxnId] = useState('');
    const [proofImage, setProofImage] = useState(null);   // base64 data URL
    const [proofFileName, setProofFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const ACCOUNTS = {
        jazzcash: '0300-1234567',
        easypaisa: '0311-9876543',
        manual: 'Contact admin at admin@tutormatch.pk',
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError('Screenshot must be under 5 MB.');
            return;
        }
        setProofFileName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => setProofImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (method !== 'manual' && !txnId.trim()) {
            setError('Please enter your transaction ID.');
            return;
        }
        if (!proofImage) {
            setError('Please upload a screenshot of your payment.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post(`/leads/${lead._id}/unlock`, {
                method,
                transactionId: txnId,
                proofImage,
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting payment');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">×</button>

                <h3 className="text-lg font-bold text-gray-800 mb-1">Unlock This Lead</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Pay <strong>Rs. 150</strong> to unlock the student's contact details.
                </p>

                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">Lead preview:</p>
                    <p>{lead.subject} — {lead.level}</p>
                    <p>{lead.board} · {lead.area}</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-lg mb-3 text-sm">{error}</div>
                )}

                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={method}
                    onChange={e => { setMethod(e.target.value); setTxnId(''); }}
                >
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">Easypaisa</option>
                    <option value="manual">Manual / Cash</option>
                </select>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 text-sm">
                    <p className="font-medium text-green-800">Send Rs. 150 to:</p>
                    <p className="text-green-700 font-mono mt-0.5">{ACCOUNTS[method]}</p>
                    {method !== 'manual' && (
                        <p className="text-green-600 text-xs mt-1">Then enter your transaction ID below.</p>
                    )}
                </div>

                {method !== 'manual' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID *</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="e.g. TXN123456789"
                            value={txnId}
                            onChange={e => setTxnId(e.target.value)}
                        />
                    </div>
                )}

                {/* Payment Screenshot Upload */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Screenshot *
                        <span className="text-gray-400 font-normal ml-1 text-xs">(JPG, PNG, max 5 MB)</span>
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        {proofImage ? (
                            <div className="flex items-center gap-2 text-sm text-green-700">
                                <img src={proofImage} alt="proof" className="h-12 w-12 object-cover rounded" />
                                <span className="text-xs text-gray-500 truncate max-w-[140px]">{proofFileName}</span>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-400 text-sm">📷 Click to upload screenshot</p>
                                <p className="text-gray-300 text-xs mt-0.5">Take a screenshot of your payment confirmation</p>
                            </div>
                        )}
                    </label>
                    {proofImage && (
                        <button
                            onClick={() => { setProofImage(null); setProofFileName(''); }}
                            className="text-xs text-red-500 mt-1 hover:underline"
                        >
                            Remove image
                        </button>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-60"
                >
                    {loading ? 'Submitting...' : 'Submit Payment for Verification'}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                    Admin verifies payments within 24 hours.
                </p>
            </div>
        </div>
    );
};

// ── My Students Tab ───────────────────────────────────────────────────────────
const MyStudentsTab = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/leads/my-unlocked')
            .then(r => setLeads(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-gray-500 py-8">Loading your students...</p>;

    if (leads.length === 0) return (
        <div className="text-center py-16">
            <div className="text-5xl mb-3">🎓</div>
            <p className="text-gray-500">No students yet.</p>
            <p className="text-gray-400 text-sm mt-1">Unlock leads from the "Available Leads" tab to see student contact details here.</p>
        </div>
    );

    const verified = leads.filter(l => l.paymentStatus === 'verified');
    const pending = leads.filter(l => l.paymentStatus === 'pending');
    const rejected = leads.filter(l => l.paymentStatus === 'rejected');

    return (
        <div className="space-y-6">
            {/* Verified — show full contact */}
            {verified.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        ✅ Unlocked Students ({verified.length})
                    </h3>
                    <div className="grid gap-3">
                        {verified.map(lead => (
                            <div key={lead._id} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <p className="font-semibold text-gray-800">{lead.subject} — {lead.level}</p>
                                        <p className="text-sm text-gray-500">{lead.board} · {lead.area}</p>
                                    </div>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Unlocked</span>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 space-y-1">
                                    <p className="text-sm font-medium text-gray-800">📛 {lead.studentName}</p>
                                    <p className="text-sm text-green-700 font-semibold">📞 {lead.studentPhone}</p>
                                    {lead.address && <p className="text-xs text-gray-500">📍 {lead.address}</p>}
                                </div>
                                {lead.description && (
                                    <p className="text-xs text-gray-400 italic mt-2">"{lead.description}"</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending payment verification */}
            {pending.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        🕐 Awaiting Verification ({pending.length})
                    </h3>
                    <div className="grid gap-3">
                        {pending.map(lead => (
                            <div key={lead._id} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-400">
                                <p className="font-semibold text-gray-800">{lead.subject} — {lead.level}</p>
                                <p className="text-sm text-gray-500 mb-2">{lead.board} · {lead.area}</p>
                                <div className="bg-yellow-50 rounded-lg px-3 py-2 text-sm text-yellow-700">
                                    Payment submitted — admin will verify within 24 hrs. Contact will appear here once approved.
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rejected payments */}
            {rejected.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        ❌ Payment Rejected ({rejected.length})
                    </h3>
                    <div className="grid gap-3">
                        {rejected.map(lead => (
                            <div key={lead._id} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-400">
                                <p className="font-semibold text-gray-800">{lead.subject} — {lead.level}</p>
                                <p className="text-sm text-gray-500 mb-2">{lead.board} · {lead.area}</p>
                                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
                                    <p className="text-sm font-medium text-red-700">❌ Payment Rejected</p>
                                    <p className="text-sm text-red-600 mt-0.5">
                                        {lead.rejectionReason || 'Payment could not be verified. Please resubmit with a clearer screenshot.'}
                                    </p>
                                    <p className="text-xs text-red-400 mt-1">You can unlock this lead again by submitting a new payment.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Available Leads Tab ───────────────────────────────────────────────────────
const AvailableLeadsTab = ({ profile }) => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unlockingLead, setUnlockingLead] = useState(null); // lead object for modal
    const [successId, setSuccessId] = useState(null);

    const fetchLeads = () => {
        setLoading(true);
        api.get('/leads')
            .then(r => setLeads(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(fetchLeads, []);

    const handleSuccess = () => {
        setUnlockingLead(null);
        setSuccessId(unlockingLead?._id);
        fetchLeads();
    };

    if (loading) return <p className="text-gray-500 py-8">Loading leads...</p>;

    if (leads.length === 0) return (
        <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500">No open leads at the moment.</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon — new student requests appear here.</p>
        </div>
    );

    return (
        <>
            {unlockingLead && (
                <PaymentModal
                    lead={unlockingLead}
                    onClose={() => setUnlockingLead(null)}
                    onSuccess={handleSuccess}
                />
            )}

            <div className="grid gap-4">
                {leads.map(lead => (
                    <div key={lead._id} className={`bg-white rounded-xl shadow-sm p-5 ${successId === lead._id ? 'border border-green-300' : ''}`}>
                        {successId === lead._id && (
                            <div className="bg-green-50 text-green-700 text-sm rounded-lg px-3 py-2 mb-3 font-medium">
                                ✅ Payment submitted! Awaiting admin verification.
                            </div>
                        )}
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-800">
                                    {lead.subject} — {lead.level}
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">Board: {lead.board}</p>
                                <p className="text-sm text-gray-500">Area: {lead.area}</p>
                                {lead.description && (
                                    <p className="text-gray-400 text-xs mt-2 italic">"{lead.description}"</p>
                                )}
                                <p className="text-gray-400 text-xs mt-2">
                                    Posted: {new Date(lead.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="text-right shrink-0">
                                <p className="text-xs text-gray-400 mb-1">🔒 Contact hidden</p>
                                <p className="text-xs font-medium text-gray-600 mb-2">Rs. 150 to unlock</p>
                                <button
                                    onClick={() => setUnlockingLead(lead)}
                                    disabled={!profile?.isVerified}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    title={!profile?.isVerified ? 'Profile must be verified first' : ''}
                                >
                                    Unlock Lead
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const TutorDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [profileMissing, setProfileMissing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('leads');

    useEffect(() => {
        api.get('/tutors/me')
            .then(r => setProfile(r.data))
            .catch(() => setProfileMissing(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center py-32">
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Banners */}
                {profileMissing && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-start justify-between gap-4">
                        <div>
                            <p className="font-semibold text-yellow-800">⚠️ Profile not set up yet</p>
                            <p className="text-yellow-700 text-sm mt-1">Complete your profile so admin can verify you.</p>
                        </div>
                        <button onClick={() => navigate('/tutor-profile-setup')} className="shrink-0 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm font-medium">
                            Set Up Profile
                        </button>
                    </div>
                )}

                {/* Rejected — show reason + re-apply option */}
                {profile?.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-300 rounded-xl p-5 mb-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="font-semibold text-red-800 text-base">❌ Application Rejected</p>
                                <p className="text-red-700 text-sm mt-1">Your tutor application was not approved by the admin.</p>
                                {profile.rejectionReason && (
                                    <div className="mt-3 bg-white border border-red-200 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Reason given:</p>
                                        <p className="text-gray-700 text-sm">{profile.rejectionReason}</p>
                                    </div>
                                )}
                                <p className="text-red-600 text-sm mt-3">
                                    You can update your profile and resubmit for review.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/tutor-profile-setup')}
                                className="shrink-0 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                            >
                                Edit & Resubmit
                            </button>
                        </div>
                    </div>
                )}

                {/* Pending — only show if status is pending (not rejected) */}
                {profile && profile.status === 'pending' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start justify-between gap-4">
                        <div>
                            <p className="font-semibold text-blue-800">🕐 Pending admin approval</p>
                            <p className="text-blue-700 text-sm mt-1">You'll be able to unlock leads once verified (usually within 24 hours).</p>
                        </div>
                        <button onClick={() => navigate('/tutor-profile-setup')} className="shrink-0 border border-blue-400 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 text-sm">
                            Edit Profile
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Tutor Dashboard</h1>
                    {profile?.isVerified && (
                        <div className="flex items-center gap-3">
                            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">✅ Verified</span>
                            <button onClick={() => navigate('/tutor-profile-setup')} className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm">
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white rounded-lg shadow p-1 mb-6 w-fit">
                    {[['leads', 'Available Leads'], ['students', 'My Students'], ['my-info', 'My Profile']].map(([t, label]) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`px-4 py-2 rounded text-sm font-medium transition ${activeTab === t ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-green-600'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {activeTab === 'leads' && <AvailableLeadsTab profile={profile} />}
                {activeTab === 'students' && <MyStudentsTab />}
                {activeTab === 'my-info' && (
                    <>
                        {!profile ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">Profile not set up yet.</p>
                                <button onClick={() => navigate('/tutor-profile-setup')} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Set Up Profile</button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-6 space-y-3 text-sm text-gray-700">
                                <div className="flex items-start justify-between">
                                    <h2 className="font-semibold text-gray-800 text-base">Your Profile</h2>
                                    <button onClick={() => navigate('/tutor-profile-setup')} className="text-green-600 hover:underline text-sm">Edit</button>
                                </div>
                                {[
                                    ['Subjects', profile.subjects?.join(', ')],
                                    ['Boards', profile.boards?.join(', ')],
                                    ['Levels', profile.levels?.join(', ')],
                                    ['Areas', profile.areas?.join(', ')],
                                    ['Fee Range', `Rs. ${profile.feeRange?.min} – ${profile.feeRange?.max}/month`],
                                    ['Rating', profile.rating > 0 ? `⭐ ${profile.rating} (${profile.totalReviews} reviews)` : 'No reviews yet'],
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <span className="font-medium">{k}:</span>{' '}
                                        <span className="text-gray-600">{v || '—'}</span>
                                    </div>
                                ))}
                                {profile.bio && (
                                    <div>
                                        <span className="font-medium">Bio:</span>
                                        <p className="text-gray-600 mt-1">{profile.bio}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TutorDashboard;