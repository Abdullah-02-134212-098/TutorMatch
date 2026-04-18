import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { BOARDS, ALL_LEVELS, ALL_SUBJECTS } from '../utils/boards';
import { KARACHI_AREAS } from '../utils/constants';

const ALL_AREAS = [
    ...KARACHI_AREAS,
    'Lahore (All Areas)', 'Islamabad (All Areas)',
    'Rawalpindi (All Areas)', 'Hyderabad (All Areas)',
];

// Pakistani highest qualifications
const QUALIFICATIONS = [
    'Matric (SSC)',
    'Intermediate (FA / FSc / ICS / ICOM)',
    'O Level',
    'A Level',
    "Bachelor's (BA / BSc / BBA / BCS)",
    'BS / BE (4-year)',
    'MBBS / BDS',
    "Master's (MA / MSc / MBA / MCS)",
    'MPhil',
    'PhD',
    'Other',
];

// CNIC: 42201-1234567-1 (5 digits - 7 digits - 1 digit)
const CNIC_REGEX = /^\d{5}-\d{7}-\d$/;

// ── Reusable MultiSelect ───────────────────────────────────────────────────────
const MultiSelect = ({ label, options, selected, onChange, cols = 3, hint }) => {
    const [query, setQuery] = useState('');
    const toggle = (val) =>
        onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
    const visible = query
        ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
        : options;

    return (
        <div className="mb-5">
            <label className="block text-gray-700 font-medium text-sm mb-1">
                {label}
                {hint && <span className="text-gray-400 font-normal ml-1 text-xs">{hint}</span>}
            </label>

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {selected.map(v => (
                        <span
                            key={v}
                            onClick={() => toggle(v)}
                            className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-red-100 hover:text-red-600 select-none"
                        >
                            {v} ×
                        </span>
                    ))}
                </div>
            )}

            <input
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-1 focus:outline-none focus:ring-1 focus:ring-green-400"
                value={query}
                onChange={e => setQuery(e.target.value)}
            />

            <div className={`grid grid-cols-2 sm:grid-cols-${cols} gap-0.5 max-h-44 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50`}>
                {visible.length === 0 && <p className="text-gray-400 text-xs p-2 col-span-full">No results</p>}
                {visible.map(opt => (
                    <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-xs py-1 px-1.5 rounded hover:bg-white">
                        <input
                            type="checkbox"
                            checked={selected.includes(opt)}
                            onChange={() => toggle(opt)}
                            className="accent-green-600 shrink-0"
                        />
                        <span className="text-gray-700 leading-snug">{opt}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

const FieldError = ({ msg }) => msg ? <p className="text-red-500 text-xs mt-0.5">{msg}</p> : null;

// ── Main component ─────────────────────────────────────────────────────────────
const TutorProfileSetup = () => {
    const navigate = useNavigate();
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        subjects: [],
        boards: [],
        levels: [],
        areas: [],
        feeMin: '',
        feeMax: '',
        experience: '',
        qualification: '',
        teachingMode: 'home',
        bio: '',
        cnic: '',
        photo: '',
    });

    useEffect(() => {
        api.get('/tutors/me')
            .then(res => {
                const t = res.data;
                setForm({
                    subjects: t.subjects || [],
                    boards: t.boards || [],
                    levels: t.levels || [],
                    areas: t.areas || [],
                    feeMin: t.feeRange?.min ?? '',
                    feeMax: t.feeRange?.max ?? '',
                    experience: t.experience ?? '',
                    qualification: t.qualification || '',
                    teachingMode: t.teachingMode || 'home',
                    bio: t.bio || '',
                    cnic: t.cnic || '',
                    photo: t.photo || '',
                });
                setIsEdit(true);
            })
            .catch(() => setIsEdit(false))
            .finally(() => setLoading(false));
    }, []);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    // CNIC auto-formatter: strips non-digits, inserts hyphens at correct positions
    const handleCnic = (raw) => {
        const digits = raw.replace(/\D/g, '').slice(0, 13);
        let formatted = digits;
        if (digits.length > 5) formatted = digits.slice(0, 5) + '-' + digits.slice(5);
        if (digits.length > 12) formatted = digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12);
        set('cnic', formatted);
        setErrors(er => ({ ...er, cnic: '' }));
    };

    const validate = () => {
        const e = {};
        if (form.subjects.length === 0) e.subjects = 'Select at least one subject';
        if (form.boards.length === 0) e.boards = 'Select at least one board';
        if (form.levels.length === 0) e.levels = 'Select at least one level';
        if (form.areas.length === 0) e.areas = 'Select at least one area';
        if (!form.feeMin || isNaN(form.feeMin) || Number(form.feeMin) < 1) e.feeMin = 'Enter a valid minimum fee (min Rs. 1)';
        if (!form.feeMax || isNaN(form.feeMax) || Number(form.feeMax) < 1) e.feeMax = 'Enter a valid maximum fee';
        if (Number(form.feeMin) >= Number(form.feeMax)) e.feeMax = 'Max must be greater than min';
        if (!CNIC_REGEX.test(form.cnic)) e.cnic = 'Format: 42201-1234567-1';
        if (!form.qualification) e.qualification = 'Select your highest qualification';
        if (form.experience === '' || form.experience === null) e.experience = 'Enter years of experience (0 if new)';
        if (Number(form.experience) < 0) e.experience = 'Experience cannot be negative';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setSaving(true);

        const payload = {
            subjects: form.subjects,
            boards: form.boards,
            levels: form.levels,
            areas: form.areas,
            feeRange: { min: Number(form.feeMin), max: Number(form.feeMax) },
            experience: Number(form.experience),
            qualification: form.qualification,
            teachingMode: form.teachingMode,
            bio: form.bio,
            cnic: form.cnic,
            photo: form.photo,
        };

        try {
            if (isEdit) await api.put('/tutors/me', payload);
            else await api.post('/tutors', payload);
            setSaved(true);
            setTimeout(() => navigate('/tutor-dashboard'), 1800);
        } catch (err) {
            setErrors({ submit: err.response?.data?.message || 'Failed to save profile' });
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-100"><Navbar />
            <div className="flex items-center justify-center py-32 text-gray-500">Loading...</div>
        </div>
    );

    if (saved) return (
        <div className="min-h-screen bg-gray-100"><Navbar />
            <div className="flex items-center justify-center py-32">
                <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {isEdit ? 'Profile Updated!' : 'Profile Submitted!'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isEdit ? 'Your changes are saved.' : 'Admin will verify your profile within 24 hours.'}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">Redirecting...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEdit ? 'Edit Your Profile' : 'Complete Your Tutor Profile'}
                    </h1>
                    {!isEdit && (
                        <p className="text-gray-500 text-sm mt-1">
                            Fill in your details so students can find you. Admin verifies within 24 hours.
                        </p>
                    )}
                </div>

                {!isEdit && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5 text-sm text-yellow-800">
                        📋 Your CNIC is used for identity verification only and will never be shown publicly.
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl shadow p-6 space-y-1">
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-2">
                            {errors.submit}
                        </div>
                    )}

                    {/* Qualification & Experience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-1">
                                Highest Qualification *
                            </label>
                            <select
                                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.qualification ? 'border-red-400' : 'border-gray-300'}`}
                                value={form.qualification}
                                onChange={e => { set('qualification', e.target.value); setErrors(er => ({ ...er, qualification: '' })); }}
                            >
                                <option value="">Select qualification...</option>
                                {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                            <FieldError msg={errors.qualification} />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-1">
                                Years of Experience *
                                <span className="text-gray-400 font-normal ml-1 text-xs">(enter 0 if new)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="50"
                                placeholder="e.g. 3"
                                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.experience ? 'border-red-400' : 'border-gray-300'}`}
                                value={form.experience}
                                onChange={e => { set('experience', e.target.value); setErrors(er => ({ ...er, experience: '' })); }}
                            />
                            <FieldError msg={errors.experience} />
                        </div>
                    </div>

                    {/* Teaching mode */}
                    <div className="mb-5">
                        <label className="block text-gray-700 font-medium text-sm mb-2">Teaching Mode *</label>
                        <div className="flex gap-3">
                            {[
                                { val: 'home', label: '🏠 Home Visit' },
                                { val: 'online', label: '💻 Online' },
                                { val: 'both', label: '🔄 Both' },
                            ].map(({ val, label }) => (
                                <label key={val} className={`flex-1 flex items-center justify-center gap-1.5 border rounded-lg py-2.5 cursor-pointer text-sm transition ${form.teachingMode === val ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                                    <input type="radio" name="teachingMode" value={val} checked={form.teachingMode === val} onChange={() => set('teachingMode', val)} className="sr-only" />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Subjects */}
                    <MultiSelect label="Subjects You Teach *" options={ALL_SUBJECTS} selected={form.subjects} onChange={v => { set('subjects', v); setErrors(e => ({ ...e, subjects: '' })); }} cols={3} />
                    <FieldError msg={errors.subjects} />

                    {/* Boards */}
                    <MultiSelect label="Boards You Cover *" options={BOARDS} selected={form.boards} onChange={v => { set('boards', v); setErrors(e => ({ ...e, boards: '' })); }} cols={4} />
                    <FieldError msg={errors.boards} />

                    {/* Levels */}
                    <MultiSelect label="Class Levels You Teach *" options={ALL_LEVELS} selected={form.levels} onChange={v => { set('levels', v); setErrors(e => ({ ...e, levels: '' })); }} cols={2} />
                    <FieldError msg={errors.levels} />

                    {/* Areas */}
                    <MultiSelect label="Areas You Travel To *" hint="(students search by area)" options={ALL_AREAS} selected={form.areas} onChange={v => { set('areas', v); setErrors(e => ({ ...e, areas: '' })); }} cols={2} />
                    <FieldError msg={errors.areas} />

                    {/* Fee Range */}
                    <div className="mb-5">
                        <label className="block text-gray-700 font-medium text-sm mb-1">Monthly Fee Range (Rs.) *</label>
                        <div className="flex gap-3 items-start">
                            <div className="flex-1">
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Min e.g. 3000"
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.feeMin ? 'border-red-400' : 'border-gray-300'}`}
                                    value={form.feeMin}
                                    onChange={e => { set('feeMin', e.target.value); setErrors(er => ({ ...er, feeMin: '', feeMax: '' })); }}
                                />
                                <FieldError msg={errors.feeMin} />
                            </div>
                            <span className="text-gray-400 text-sm pt-3">to</span>
                            <div className="flex-1">
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Max e.g. 8000"
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.feeMax ? 'border-red-400' : 'border-gray-300'}`}
                                    value={form.feeMax}
                                    onChange={e => { set('feeMax', e.target.value); setErrors(er => ({ ...er, feeMax: '' })); }}
                                />
                                <FieldError msg={errors.feeMax} />
                            </div>
                        </div>
                    </div>

                    {/* CNIC */}
                    <div className="mb-5">
                        <label className="block text-gray-700 font-medium text-sm mb-1">
                            CNIC * <span className="text-gray-400 font-normal text-xs">(verification only — never shown publicly)</span>
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="42201-1234567-1"
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.cnic ? 'border-red-400' : 'border-gray-300'}`}
                            value={form.cnic}
                            onChange={e => handleCnic(e.target.value)}
                            maxLength={15}
                        />
                        <FieldError msg={errors.cnic} />
                        {!errors.cnic && form.cnic && CNIC_REGEX.test(form.cnic) && (
                            <p className="text-green-600 text-xs mt-0.5">✓ Valid format</p>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="mb-5">
                        <label className="block text-gray-700 font-medium text-sm mb-1">
                            Bio <span className="text-gray-400 font-normal text-xs">(shown on your public profile)</span>
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Describe your teaching experience, approach, and why students should choose you..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                            value={form.bio}
                            onChange={e => set('bio', e.target.value)}
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-400 text-right mt-0.5">{form.bio.length}/500</p>
                    </div>

                    {/* Photo URL */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium text-sm mb-1">
                            Profile Photo URL <span className="text-gray-400 font-normal text-xs">(optional)</span>
                        </label>
                        <input
                            type="url"
                            placeholder="https://..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            value={form.photo}
                            onChange={e => set('photo', e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Submit Profile for Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TutorProfileSetup;