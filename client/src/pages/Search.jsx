import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { BOARDS, ALL_SUBJECTS } from '../utils/boards';
import { KARACHI_AREAS } from '../utils/constants';

const ALL_AREAS = [...KARACHI_AREAS, 'Lahore (All Areas)', 'Islamabad (All Areas)', 'Rawalpindi (All Areas)', 'Other'];
const ALL_LEVELS = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12', 'O Level', 'A Level',
    'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
    'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8',
    'MBA', 'MS / MPhil',
];

// ── Searchable autocomplete dropdown ─────────────────────────────────────────
const AutoComplete = ({ placeholder, value, onChange, options }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const ref = useRef(null);

    useEffect(() => { setQuery(value); }, [value]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = query.length < 1
        ? options.slice(0, 10)
        : options.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 10);

    const handleChange = (val) => { setQuery(val); onChange(val); setOpen(true); };
    const select = (val) => { setQuery(val); onChange(val); setOpen(false); };
    const clear = () => { setQuery(''); onChange(''); };

    return (
        <div ref={ref} className="relative">
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-400 bg-white">
                <input
                    type="text"
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none rounded-lg bg-transparent text-gray-700"
                    value={query}
                    onChange={e => handleChange(e.target.value)}
                    onFocus={() => setOpen(true)}
                />
                {query && (
                    <button onClick={clear} className="pr-3 text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
                )}
            </div>
            {open && filtered.length > 0 && (
                <ul className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
                    {filtered.map(opt => (
                        <li
                            key={opt}
                            onMouseDown={() => select(opt)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 cursor-pointer"
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ── Tutor card ────────────────────────────────────────────────────────────────
const TutorCard = ({ tutor, onClick }) => {
    const name = tutor.userId?.name || 'Tutor';
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition cursor-pointer border border-gray-100 hover:border-green-200 flex flex-col"
        >
            <div className="flex items-center gap-3 mb-3">
                {tutor.photo ? (
                    <img src={tutor.photo} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xl shrink-0">
                        {name.charAt(0)}
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{name}</h3>
                    <p className="text-gray-400 text-xs">
                        {tutor.userId?.city}
                        {tutor.experience > 0 ? ` · ${tutor.experience} yr exp` : ''}
                    </p>
                </div>
                {tutor.isVerified && (
                    <span className="ml-auto shrink-0 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                )}
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
                {tutor.subjects?.slice(0, 3).map(s => (
                    <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                ))}
                {tutor.subjects?.length > 3 && (
                    <span className="text-gray-400 text-xs self-center">+{tutor.subjects.length - 3} more</span>
                )}
            </div>

            <div className="mt-auto">
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs truncate pr-2">{tutor.areas?.slice(0, 2).join(', ')}</span>
                    <span className="font-semibold text-green-700 text-sm shrink-0">
                        Rs. {tutor.feeRange?.min?.toLocaleString()}–{tutor.feeRange?.max?.toLocaleString()}/mo
                    </span>
                </div>
                {tutor.rating > 0 && (
                    <p className="text-xs text-yellow-600 mt-1">⭐ {tutor.rating.toFixed(1)} ({tutor.totalReviews} reviews)</p>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-green-600 text-xs font-medium">View Profile →</span>
                </div>
            </div>
        </div>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        subject: searchParams.get('subject') || '',
        area: searchParams.get('area') || '',
        board: '',
        level: '',
    });

    const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

    const fetchTutors = useCallback(async (f) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (f.subject) params.append('subject', f.subject);
            if (f.area) params.append('area', f.area);
            if (f.board) params.append('board', f.board);
            if (f.level) params.append('level', f.level);
            const res = await api.get(`/tutors?${params.toString()}`);
            setTutors(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, []);

    // Run on mount with URL params
    useEffect(() => { fetchTutors(filters); }, []);

    const handleSearch = () => {
        const p = {};
        if (filters.subject) p.subject = filters.subject;
        if (filters.area) p.area = filters.area;
        setSearchParams(p);
        fetchTutors(filters);
    };

    const applyQuickSubject = (s) => {
        const f = { ...filters, subject: s };
        setFilters(f);
        setSearchParams({ subject: s });
        fetchTutors(f);
    };

    const clearAll = () => {
        const f = { subject: '', area: '', board: '', level: '' };
        setFilters(f);
        setSearchParams({});
        fetchTutors(f);
    };

    const hasFilters = filters.subject || filters.area || filters.board || filters.level;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-2xl font-bold text-gray-800">Find Tutors</h1>
                    {hasFilters && (
                        <button onClick={clearAll} className="text-sm text-gray-400 hover:text-red-500 transition">
                            Clear all ×
                        </button>
                    )}
                </div>

                {/* ── Filter bar ── */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <AutoComplete
                            placeholder="📚 Subject e.g. Mathematics"
                            value={filters.subject}
                            onChange={v => setFilter('subject', v)}
                            options={ALL_SUBJECTS}
                        />
                        <AutoComplete
                            placeholder="📍 Area e.g. DHA, Gulshan"
                            value={filters.area}
                            onChange={v => setFilter('area', v)}
                            options={ALL_AREAS}
                        />
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
                            value={filters.board}
                            onChange={e => setFilter('board', e.target.value)}
                        >
                            <option value="">All Boards</option>
                            {BOARDS.map(b => <option key={b}>{b}</option>)}
                        </select>
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
                            value={filters.level}
                            onChange={e => setFilter('level', e.target.value)}
                        >
                            <option value="">All Levels</option>
                            {ALL_LEVELS.map(l => <option key={l}>{l}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleSearch}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition"
                        >
                            Search
                        </button>
                        <span className="text-gray-300 text-xs hidden sm:block">Quick:</span>
                        {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Accounting'].map(s => (
                            <button
                                key={s}
                                onClick={() => applyQuickSubject(s)}
                                className={`text-xs px-3 py-1 rounded-full border transition ${filters.subject === s
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-600'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Result count ── */}
                {!loading && (
                    <p className="text-sm text-gray-500 mb-4">
                        {tutors.length === 0
                            ? 'No tutors found'
                            : `${tutors.length} tutor${tutors.length !== 1 ? 's' : ''} found`}
                        {hasFilters && ' for your filters'}
                    </p>
                )}

                {/* ── Results ── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                                <div className="flex gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
                                    <div className="flex-1 space-y-2 pt-1">
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : tutors.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-600 text-lg font-medium">No tutors found</p>
                        <p className="text-gray-400 text-sm mt-1 mb-6">Try a different subject or area, or clear filters</p>
                        <button onClick={clearAll} className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 text-sm font-medium">
                            Show All Tutors
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tutors.map(tutor => (
                            <TutorCard
                                key={tutor._id}
                                tutor={tutor}
                                onClick={() => navigate(`/tutor/${tutor._id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;