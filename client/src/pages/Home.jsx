import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { ALL_SUBJECTS } from '../utils/boards';
import { KARACHI_AREAS, CITIES } from '../utils/constants';

// All searchable areas = Karachi areas + other cities
const ALL_AREAS = [...KARACHI_AREAS, 'Lahore', 'Islamabad', 'Rawalpindi', 'Hyderabad'];

// Autofill dropdown component
const AutoComplete = ({ placeholder, value, onChange, options, icon }) => {
    const [open, setOpen] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleChange = (val) => {
        onChange(val);
        const q = val.toLowerCase();
        setFiltered(
            q.length < 1
                ? options.slice(0, 8)
                : options.filter((o) => o.toLowerCase().includes(q)).slice(0, 8)
        );
        setOpen(true);
    };

    const handleFocus = () => {
        setFiltered(value ? options.filter(o => o.toLowerCase().includes(value.toLowerCase())).slice(0, 8) : options.slice(0, 8));
        setOpen(true);
    };

    const select = (val) => {
        onChange(val);
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative flex-1">
            <div className="flex items-center">
                {icon && <span className="absolute left-3 text-gray-400 text-sm">{icon}</span>}
                <input
                    type="text"
                    placeholder={placeholder}
                    className={`w-full ${icon ? 'pl-8' : 'pl-4'} pr-4 py-3 text-gray-800 focus:outline-none rounded-lg text-sm`}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={handleFocus}
                />
            </div>
            {open && filtered.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto mt-1">
                    {filtered.map((opt) => (
                        <li
                            key={opt}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 cursor-pointer"
                            onMouseDown={() => select(opt)}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Tutor card for featured section
const TutorCard = ({ tutor, onClick }) => {
    const name = tutor.userId?.name || 'Tutor';
    const initial = name.charAt(0).toUpperCase();
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-5 border border-gray-100"
        >
            <div className="flex items-center gap-3 mb-3">
                {tutor.photo ? (
                    <img src={tutor.photo} alt={name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                        {initial}
                    </div>
                )}
                <div>
                    <p className="font-semibold text-gray-800">{name}</p>
                    <p className="text-xs text-gray-500">{tutor.userId?.city || 'Karachi'}</p>
                </div>
                {tutor.isVerified && (
                    <span className="ml-auto bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">✓ Verified</span>
                )}
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
                {tutor.subjects?.slice(0, 3).map((s) => (
                    <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                ))}
                {tutor.subjects?.length > 3 && (
                    <span className="text-gray-400 text-xs">+{tutor.subjects.length - 3} more</span>
                )}
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 text-xs">{tutor.areas?.slice(0, 2).join(', ')}</span>
                <span className="font-medium text-green-700">
                    Rs. {tutor.feeRange?.min?.toLocaleString()}–{tutor.feeRange?.max?.toLocaleString()}/mo
                </span>
            </div>

            {tutor.rating > 0 && (
                <p className="text-xs text-yellow-600 mt-1">⭐ {tutor.rating} ({tutor.totalReviews} reviews)</p>
            )}
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [subject, setSubject] = useState('');
    const [area, setArea] = useState('');
    const [featuredTutors, setFeaturedTutors] = useState([]);
    const [loadingTutors, setLoadingTutors] = useState(true);

    useEffect(() => {
        api.get('/tutors?limit=6')
            .then((r) => setFeaturedTutors(r.data.slice(0, 6)))
            .catch(() => { })
            .finally(() => setLoadingTutors(false));
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (subject) params.set('subject', subject);
        if (area) params.set('area', area);
        navigate(`/search?${params.toString()}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            {/* ── Hero ── */}
            <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
                        Find a Trusted Home Tutor Near You
                    </h1>
                    <p className="text-green-100 text-lg mb-10">
                        Verified tutors in Karachi — Matric, O Levels, A Levels, University
                    </p>

                    {/* Search bar */}
                    <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
                        <AutoComplete
                            placeholder="Subject (e.g. Mathematics)"
                            value={subject}
                            onChange={setSubject}
                            options={ALL_SUBJECTS}
                            icon="📚"
                        />
                        <div className="hidden sm:block w-px bg-gray-200 my-1" />
                        <AutoComplete
                            placeholder="Area (e.g. Gulshan, DHA)"
                            value={area}
                            onChange={setArea}
                            options={ALL_AREAS}
                            icon="📍"
                        />
                        <button
                            onClick={handleSearch}
                            onKeyDown={handleKeyDown}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium text-sm shrink-0"
                        >
                            Search
                        </button>
                    </div>

                    {/* Quick subject pills */}
                    <div className="flex flex-wrap justify-center gap-2 mt-5">
                        {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Accounting'].map((s) => (
                            <button
                                key={s}
                                onClick={() => { setSubject(s); navigate(`/search?subject=${s}`); }}
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-1.5 rounded-full transition border border-white border-opacity-30"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Tutors ── */}
            <section className="max-w-5xl mx-auto w-full px-4 py-14">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Featured Tutors</h2>
                    <button
                        onClick={() => navigate('/search')}
                        className="text-green-600 text-sm hover:underline"
                    >
                        View all →
                    </button>
                </div>

                {loadingTutors ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
                                <div className="flex gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded mb-2 w-full" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : featuredTutors.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-4xl mb-2">👨‍🏫</p>
                        <p>Tutors will appear here once verified.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuredTutors.map((tutor) => (
                            <TutorCard
                                key={tutor._id}
                                tutor={tutor}
                                onClick={() => navigate(`/tutor/${tutor._id}`)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ── How it works ── */}
            <section className="bg-white py-14 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">How It Works</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                        {[
                            { icon: '🔍', title: 'Search', desc: 'Search tutors by subject, area, board and class level — completely free' },
                            { icon: '📋', title: 'Request', desc: 'Submit your request and verified tutors in your area will contact you' },
                            { icon: '✅', title: 'Learn', desc: 'Start learning with a CNIC-verified tutor at your doorstep' },
                        ].map(({ icon, title, desc }) => (
                            <div key={title} className="bg-gray-50 rounded-xl p-6">
                                <div className="text-4xl mb-3">{icon}</div>
                                <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Tutor CTA ── */}
            <section className="bg-green-50 py-14 px-4 text-center">
                <div className="max-w-xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Are you a Tutor?</h2>
                    <p className="text-gray-600 mb-6">
                        Get verified student leads in your area. Pay only when you find a match.
                    </p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg text-base hover:bg-green-700 transition font-medium"
                    >
                        Join as Tutor — Free
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="mt-auto bg-gray-800 text-gray-400 text-center py-5 text-sm">
                <p>© {new Date().getFullYear()} TutorMatch PK — Karachi's trusted tutor marketplace</p>
            </footer>
        </div>
    );
};

export default Home;