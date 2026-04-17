import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Usage:
//   <ProtectedRoute>                        — any logged-in user
//   <ProtectedRoute role="tutor">           — tutors only
//   <ProtectedRoute role="admin">           — admins only
//   <ProtectedRoute role={['tutor','admin']}> — multiple roles

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    // Wait until AuthContext has read localStorage
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    // Not logged in → send to login, remember where they were going
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role check (single string or array)
    if (role) {
        const allowed = Array.isArray(role) ? role : [role];
        if (!user?.role || !allowed.includes(user.role)) {
            return (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow p-8 text-center max-w-sm">
                        <div className="text-5xl mb-4">🚫</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
                        <p className="text-gray-500 text-sm mb-4">
                            You don't have permission to view this page.
                        </p>
                        <a
                            href="/"
                            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            );
        }
    }

    return children;
};

export default ProtectedRoute;