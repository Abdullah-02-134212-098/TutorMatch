import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const homeLink = user?.role === 'admin' ? '/admin' : '/';

    return (
        <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
            <Link to={homeLink} className="text-2xl font-bold text-green-600">
                TutorMatch PK
            </Link>

            <div className="flex items-center gap-4">
                {!user ? (
                    <>
                        <Link to="/login" className="text-gray-600 hover:text-green-600 text-sm">Login</Link>
                        <Link to="/signup" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                            Sign Up
                        </Link>
                    </>
                ) : (
                    <>
                        <span className="text-gray-600 text-sm">Hi, {user.name}</span>
                        {user.role === 'tutor' && (
                            <Link to="/tutor-dashboard" className="text-gray-600 hover:text-green-600 text-sm">Dashboard</Link>
                        )}
                        {user.role === 'student' && (
                            <Link to="/student-dashboard" className="text-gray-600 hover:text-green-600 text-sm">Dashboard</Link>
                        )}
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-gray-600 hover:text-green-600 text-sm">Admin Panel</Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;