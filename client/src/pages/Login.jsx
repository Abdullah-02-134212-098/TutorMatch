import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ── Forgot Password Modal (3-step: email → OTP → new password) ──
const ForgotPasswordModal = ({ onClose }) => {
    const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newpw, 4=done
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email.includes('@')) { setError('Enter a valid email'); return; }
        setLoading(true); setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
        setLoading(true); setError('');
        try {
            await api.post('/auth/verify-otp', { email, otp });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (newPassword !== confirmPw) { setError('Passwords do not match'); return; }
        setLoading(true); setError('');
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
                >×</button>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`w-2.5 h-2.5 rounded-full transition ${step >= s ? 'bg-green-600' : 'bg-gray-200'}`} />
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Step 1 — Email */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp}>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Forgot Password</h3>
                        <p className="text-gray-500 text-sm mb-4">Enter your email — we'll send you a 6-digit OTP.</p>
                        <input
                            type="email"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-60"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2 — OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Enter OTP</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            A 6-digit OTP was sent to <strong>{email}</strong>. It expires in 15 minutes.
                        </p>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
                            placeholder="000000"
                            value={otp}
                            onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-60 mb-2"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep(1); setOtp(''); setError(''); }}
                            className="w-full text-gray-500 text-sm hover:text-green-600 py-1"
                        >
                            ← Change email
                        </button>
                    </form>
                )}

                {/* Step 3 — New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">New Password</h3>
                        <p className="text-gray-500 text-sm mb-4">Choose a new password for your account.</p>
                        <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-3"
                            placeholder="New password (min 6 chars)"
                            value={newPassword}
                            onChange={e => { setNewPassword(e.target.value); setError(''); }}
                            autoFocus
                        />
                        <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
                            placeholder="Confirm new password"
                            value={confirmPw}
                            onChange={e => { setConfirmPw(e.target.value); setError(''); }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-60"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {/* Step 4 — Done */}
                {step === 4 && (
                    <div className="text-center py-4">
                        <div className="text-5xl mb-3">✅</div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Password Reset!</h3>
                        <p className="text-gray-500 text-sm mb-4">You can now log in with your new password.</p>
                        <button
                            onClick={onClose}
                            className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Login Page ────────────────────────────────────────────────────────────────
const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', form);
            login(res.data.token, { name: res.data.name, role: res.data.role, id: res.data.id });
            if (res.data.role === 'admin') navigate('/admin');
            else if (res.data.role === 'tutor') navigate('/tutor-dashboard');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        }
        setLoading(false);
    };

    return (
        <>
            {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-green-600">Welcome Back</h2>
                        <p className="text-gray-500 text-sm mt-1">Login to TutorMatch PK</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                autoFocus
                            />
                        </div>

                        <div className="mb-2">
                            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                placeholder="Your password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </div>

                        <div className="text-right mb-5">
                            <button
                                type="button"
                                onClick={() => setShowForgot(true)}
                                className="text-green-600 text-sm hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-60"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-4 text-sm">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-green-600 hover:underline font-medium">Sign up</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login; 