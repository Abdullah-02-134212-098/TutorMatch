import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Hyderabad', 'Faisalabad', 'Multan'];

const Signup = () => {
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        phone: '', role: 'student', city: 'Karachi'
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const set = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        setErrors(e => ({ ...e, [key]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.email.includes('@')) e.email = 'Enter a valid email';
        if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        if (!/^03\d{9}$/.test(form.phone)) e.phone = 'Enter a valid Pakistani number (03XXXXXXXXX)';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        setServerError('');
        try {
            const { confirmPassword, ...payload } = form;
            const res = await api.post('/auth/register', payload);
            login(res.data.token, { name: res.data.name, role: res.data.role, id: res.data.id });
            if (res.data.role === 'tutor') navigate('/tutor-profile-setup');
            else navigate('/student-dashboard');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Signup failed. Please try again.');
        }
        setLoading(false);
    };

    const Field = ({ label, error, children }) => (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );

    const inputClass = (key) =>
        `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${errors[key] ? 'border-red-400' : 'border-gray-300'
        }`;

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-green-600">Join TutorMatch PK</h2>
                    <p className="text-gray-500 text-sm mt-1">Create your free account</p>
                </div>

                {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <Field label="Full Name" error={errors.name}>
                        <input
                            type="text"
                            className={inputClass('name')}
                            placeholder="Ahmed Ali"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                        />
                    </Field>

                    <Field label="Email" error={errors.email}>
                        <input
                            type="email"
                            className={inputClass('email')}
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                        />
                    </Field>

                    <Field label="Phone Number" error={errors.phone}>
                        <input
                            type="text"
                            className={inputClass('phone')}
                            placeholder="03001234567"
                            value={form.phone}
                            onChange={(e) => set('phone', e.target.value)}
                            maxLength={11}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="I am a" error={errors.role}>
                            <select
                                className={inputClass('role')}
                                value={form.role}
                                onChange={(e) => set('role', e.target.value)}
                            >
                                <option value="student">Student / Parent</option>
                                <option value="tutor">Tutor</option>
                            </select>
                        </Field>

                        <Field label="City" error={errors.city}>
                            <select
                                className={inputClass('city')}
                                value={form.city}
                                onChange={(e) => set('city', e.target.value)}
                            >
                                {CITIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </Field>
                    </div>

                    <Field label="Password" error={errors.password}>
                        <input
                            type="password"
                            className={inputClass('password')}
                            placeholder="Min 6 characters"
                            value={form.password}
                            onChange={(e) => set('password', e.target.value)}
                        />
                    </Field>

                    <Field label="Confirm Password" error={errors.confirmPassword}>
                        <input
                            type="password"
                            className={inputClass('confirmPassword')}
                            placeholder="Re-enter password"
                            value={form.confirmPassword}
                            onChange={(e) => set('confirmPassword', e.target.value)}
                        />
                    </Field>

                    {form.role === 'tutor' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-xs text-green-700">
                            After signing up, you'll complete your tutor profile. Your account needs admin approval before going live.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-60 mt-1"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-gray-500 mt-4 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-600 hover:underline font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;