const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ── Email transporter (Gmail SMTP) ────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,   // Gmail App Password (not your login password)
    },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── REGISTER ──────────────────────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, city } = req.body;

        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            passwordHash,
            phone,
            role,
            city: city || 'Karachi',
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ token, role: user.role, name: user.name, id: user._id });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, role: user.role, name: user.name, id: user._id });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── GET ME ────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash -resetOtp -resetOtpExpiry');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── FORGOT PASSWORD — send OTP to email ──────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email });
        // Always return success to prevent email enumeration
        if (!user) return res.json({ message: 'If that email exists, an OTP has been sent.' });

        const otp = generateOtp();
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        user.resetOtp = otp;
        user.resetOtpExpiry = expiry;
        await user.save();

        await transporter.sendMail({
            from: `"TutorMatch PK" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your TutorMatch Password Reset OTP',
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px">
                    <h2 style="color:#16a34a;margin-bottom:8px">TutorMatch PK</h2>
                    <p style="color:#374151">You requested a password reset. Use the OTP below:</p>
                    <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#16a34a;text-align:center;padding:24px 0">
                        ${otp}
                    </div>
                    <p style="color:#6b7280;font-size:13px">This OTP expires in <strong>15 minutes</strong>. If you didn't request this, ignore this email.</p>
                </div>
            `,
        });

        res.json({ message: 'If that email exists, an OTP has been sent.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── VERIFY OTP ────────────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

        const user = await User.findOne({ email });
        if (!user || !user.resetOtp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (user.resetOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.resetOtpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        res.json({ message: 'OTP verified', valid: true });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.resetOtp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (user.resetOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.resetOtpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully. You can now log in.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login, getMe, forgotPassword, verifyOtp, resetPassword };