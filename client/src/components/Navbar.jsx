import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-green-600">
                TutorMatch PK
            </Link>

            <div className="flex items-center gap-4">
                {!user ? (
                    <>
                        <Link to="/login" className="text-gray-600 hover:text-green-600">
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Sign Up
                        </Link>
                    </>
                ) : (
                    <>
                        <span className="text-gray-600">Hi, {user.name}</span>
                        {user.role === 'tutor' && (
                            <Link to="/tutor-dashboard" className="text-gray-600 hover:text-green-600">
                                Dashboard
                            </Link>
                        )}
                        {user.role === 'student' && (
                            <Link to="/student-dashboard" className="text-gray-600 hover:text-green-600">
                                Dashboard
                            </Link>
                        )}
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-gray-600 hover:text-green-600">
                                Admin Panel
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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