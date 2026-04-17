import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const TutorDashboard = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [profile, setProfile] = useState(null);   // null = not loaded yet
    const [profileMissing, setProfileMissing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('leads');

    useEffect(() => {
        // Load profile status and leads in parallel
        Promise.all([
            api.get('/tutors/me').catch(() => null),
            api.get('/leads').catch(() => ({ data: [] }))
        ]).then(([profileRes, leadsRes]) => {
            if (!profileRes) {
                setProfileMissing(true);
            } else {
                setProfile(profileRes.data);
            }
            setLeads(leadsRes.data);
        }).finally(() => setLoading(false));
    }, []);

    const handleUnlock = async (leadId) => {
        try {
            await api.post(`/leads/${leadId}/unlock`);
            alert('Payment submitted! Waiting for admin verification.');
            // Refresh leads
            const res = await api.get('/leads');
            setLeads(res.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Error unlocking lead');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="flex items-center justify-center py-32">
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6">

                {/* Profile incomplete banner */}
                {profileMissing && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6 flex items-start justify-between gap-4">
                        <div>
                            <p className="font-semibold text-yellow-800">
                                ⚠️ Your profile is not set up yet
                            </p>
                            <p className="text-yellow-700 text-sm mt-1">
                                Complete your tutor profile so admin can verify you and students can find you.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/tutor-profile-setup')}
                            className="shrink-0 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
                        >
                            Set Up Profile
                        </button>
                    </div>
                )}

                {/* Profile pending approval banner */}
                {profile && !profile.isVerified && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start justify-between gap-4">
                        <div>
                            <p className="font-semibold text-blue-800">
                                🕐 Profile pending admin approval
                            </p>
                            <p className="text-blue-700 text-sm mt-1">
                                You'll be able to unlock leads once your profile is verified (usually within 24 hours).
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/tutor-profile-setup')}
                            className="shrink-0 border border-blue-400 text-blue-700 px-4 py-2 rounded hover:bg-blue-100 text-sm"
                        >
                            Edit Profile
                        </button>
                    </div>
                )}

                {/* Header row */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Tutor Dashboard</h1>
                    {profile?.isVerified && (
                        <div className="flex items-center gap-3">
                            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                                ✅ Verified
                            </span>
                            <button
                                onClick={() => navigate('/tutor-profile-setup')}
                                className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-50 text-sm"
                            >
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white rounded-lg shadow p-1 mb-6 w-fit">
                    {['leads', 'my-info'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded text-sm font-medium transition ${activeTab === tab
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-600 hover:text-green-600'
                                }`}
                        >
                            {tab === 'leads' ? 'Available Leads' : 'My Profile'}
                        </button>
                    ))}
                </div>

                {/* ── Leads tab ── */}
                {activeTab === 'leads' && (
                    <>
                        {leads.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-5xl mb-3">📋</div>
                                <p className="text-gray-500">No open leads at the moment.</p>
                                <p className="text-gray-400 text-sm mt-1">Check back soon — new student requests appear here.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {leads.map((lead) => (
                                    <div key={lead._id} className="bg-white rounded-lg shadow p-5">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {lead.subject} — {lead.level}
                                                </h3>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    Board: {lead.board}
                                                </p>
                                                <p className="text-gray-600 text-sm">
                                                    Area: {lead.area}
                                                </p>
                                                {lead.description && (
                                                    <p className="text-gray-500 text-sm mt-2 italic">
                                                        "{lead.description}"
                                                    </p>
                                                )}
                                                <p className="text-gray-400 text-xs mt-2">
                                                    Posted: {new Date(lead.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-gray-400 mb-1">
                                                    🔒 Contact hidden
                                                </p>
                                                <p className="text-xs text-gray-500 mb-2">
                                                    Rs. 150 to unlock
                                                </p>
                                                <button
                                                    onClick={() => handleUnlock(lead._id)}
                                                    disabled={!profile?.isVerified}
                                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title={!profile?.isVerified ? 'Profile must be verified first' : ''}
                                                >
                                                    Unlock Lead
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── My Profile tab ── */}
                {activeTab === 'my-info' && (
                    <>
                        {!profile ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">You haven't set up your profile yet.</p>
                                <button
                                    onClick={() => navigate('/tutor-profile-setup')}
                                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                                >
                                    Set Up Profile
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Your Profile</h2>
                                    <button
                                        onClick={() => navigate('/tutor-profile-setup')}
                                        className="text-sm text-green-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                </div>

                                <div className="space-y-3 text-sm text-gray-700">
                                    <div>
                                        <span className="font-medium">Subjects:</span>{' '}
                                        <span className="text-gray-600">{profile.subjects?.join(', ') || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Boards:</span>{' '}
                                        <span className="text-gray-600">{profile.boards?.join(', ') || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Levels:</span>{' '}
                                        <span className="text-gray-600">{profile.levels?.join(', ') || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Areas:</span>{' '}
                                        <span className="text-gray-600">{profile.areas?.join(', ') || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Fee Range:</span>{' '}
                                        Rs. {profile.feeRange?.min} – {profile.feeRange?.max}/month
                                    </div>
                                    <div>
                                        <span className="font-medium">Rating:</span>{' '}
                                        {profile.rating > 0 ? `⭐ ${profile.rating} (${profile.totalReviews} reviews)` : 'No reviews yet'}
                                    </div>
                                    {profile.bio && (
                                        <div>
                                            <span className="font-medium">Bio:</span>
                                            <p className="text-gray-600 mt-1">{profile.bio}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default TutorDashboard;