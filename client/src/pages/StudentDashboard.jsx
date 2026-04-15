import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const StudentDashboard = () => {
    const [form, setForm] = useState({
        studentName: '', studentPhone: '', subject: '',
        board: 'Sindh', level: 'Class 10', area: '', description: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/leads', form);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting request');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Find a Tutor
                </h1>

                {submitted ? (
                    <div className="bg-green-100 text-green-700 p-6 rounded-lg text-center">
                        <h2 className="text-xl font-bold mb-2">Request Submitted! ✅</h2>
                        <p>Tutors in your area will contact you soon.</p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Submit Another Request
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-6">
                        {error && (
                            <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Your Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-green-500"
                                    value={form.studentName}
                                    onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-green-500"
                                    placeholder="03001234567"
                                    value={form.studentPhone}
                                    onChange={(e) => setForm({ ...form, studentPhone: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-green-500"
                                    placeholder="e.g. Mathematics"
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Board</label>
                                <select
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-green-500"
                                    value={form.board}
                                    onChange={(e) => setForm({ ...form, board: e.target.value })}
                                >
                                    <option>Sindh</option>
                                    <option>Federal</option>
                                    <option>Punjab</option>
                                    <option>O Level</option>
                                    <option>A Level</option>
                                    <option>Aga Khan</option>
                                    <option>University</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Class Level</label>
                                <select
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-green-500"
                                    value={form.level}
                                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                                >
                                    <option>Class 1</option>
                                    <option>Class 2</option>
                                    <option>Class 3</option>
                                    <option>Class 4</option>
                                    <option>Class 5</option>
                                    <option>Class 6</option>
                                    <option>Class 7</option>
                                    <option>Class 8</option>
                                    <option>Class 9</option>
                                    <option>Class 10</option>
                                    <option>Class 11</option>
                                    <option>Class 12</option>
                                    <option>O Level</option>
                                    <option>A Level</option>
                                    <option>University</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Area</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-green-500"
                                    placeholder="e.g. Gulshan, DHA, Clifton"
                                    value={form.area}
                                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-1">Additional Details</label>
                                <textarea
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-green-500"
                                    rows="3"
                                    placeholder="Any specific requirements..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                            >
                                {loading ? 'Submitting...' : 'Find Me a Tutor'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;