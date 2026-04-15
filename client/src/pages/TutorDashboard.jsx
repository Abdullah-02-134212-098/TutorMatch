import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const TutorDashboard = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await api.get('/leads');
            setLeads(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleUnlock = async (leadId) => {
        try {
            await api.post(`/leads/${leadId}/unlock`);
            alert('Payment submitted! Waiting for admin verification.');
            fetchLeads();
        } catch (err) {
            alert(err.response?.data?.message || 'Error unlocking lead');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Available Leads
                </h1>

                {loading ? (
                    <p className="text-gray-500">Loading leads...</p>
                ) : leads.length === 0 ? (
                    <p className="text-gray-500">No leads available right now.</p>
                ) : (
                    <div className="grid gap-4">
                        {leads.map((lead) => (
                            <div key={lead._id} className="bg-white rounded-lg shadow p-5">
                                <div className="flex justify-between items-start">
                                    <div>
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
                                            <p className="text-gray-500 text-sm mt-2">
                                                {lead.description}
                                            </p>
                                        )}
                                        <p className="text-gray-400 text-xs mt-2">
                                            Posted: {new Date(lead.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 mb-2">
                                            Contact hidden
                                        </p>
                                        <button
                                            onClick={() => handleUnlock(lead._id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                                        >
                                            Unlock Lead
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorDashboard;