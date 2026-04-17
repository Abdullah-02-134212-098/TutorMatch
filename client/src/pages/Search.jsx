import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Search = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        subject: searchParams.get('subject') || '',
        area: searchParams.get('area') || '',
        board: '',
        level: ''
    });

    useEffect(() => {
        fetchTutors();
    }, []);

    const fetchTutors = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.subject) params.append('subject', filters.subject);
            if (filters.area) params.append('area', filters.area);
            if (filters.board) params.append('board', filters.board);
            if (filters.level) params.append('level', filters.level);

            const res = await api.get(`/tutors?${params.toString()}`);
            setTutors(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Find Tutors</h1>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Subject"
                        className="border rounded px-3 py-2 focus:outline-none focus:border-green-500"
                        value={filters.subject}
                        onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Area"
                        className="border rounded px-3 py-2 focus:outline-none focus:border-green-500"
                        value={filters.area}
                        onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                    />
                    <select
                        className="border rounded px-3 py-2 focus:outline-none focus:border-green-500"
                        value={filters.board}
                        onChange={(e) => setFilters({ ...filters, board: e.target.value })}
                    >
                        <option value="">All Boards</option>
                        <option>Sindh</option>
                        <option>Federal</option>
                        <option>Punjab</option>
                        <option>O Level</option>
                        <option>A Level</option>
                        <option>Aga Khan</option>
                        <option>University</option>
                    </select>
                    <select
                        className="border rounded px-3 py-2 focus:outline-none focus:border-green-500"
                        value={filters.level}
                        onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                    >
                        <option value="">All Levels</option>
                        <option>Class 9</option>
                        <option>Class 10</option>
                        <option>Class 11</option>
                        <option>Class 12</option>
                        <option>O Level</option>
                        <option>A Level</option>
                        <option>University</option>
                    </select>
                </div>

                <button
                    onClick={fetchTutors}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mb-6"
                >
                    Search
                </button>

                {/* Results */}
                {loading ? (
                    <p className="text-gray-500">Loading tutors...</p>
                ) : tutors.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No tutors found.</p>
                        <p className="text-gray-400 text-sm mt-2">Try different filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tutors.map((tutor) => (
                            <div key={tutor._id} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                                        {tutor.userId?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{tutor.userId?.name}</h3>
                                        <p className="text-gray-500 text-sm">{tutor.userId?.city}</p>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Subjects:</span>{' '}
                                        {tutor.subjects?.join(', ')}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Areas:</span>{' '}
                                        {tutor.areas?.join(', ')}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Fee:</span>{' '}
                                        Rs. {tutor.feeRange?.min} - {tutor.feeRange?.max}/month
                                    </p>
                                </div>

                                {tutor.isVerified && (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                        ✅ Verified
                                    </span>
                                )}

                                <button
                                    onClick={() => navigate('/student-dashboard')}
                                    className="w-full mt-3 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
                                >
                                    Request This Tutor
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;