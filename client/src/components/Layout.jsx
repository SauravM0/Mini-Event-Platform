import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <nav className="navbar">
                <div className="container">
                    <Link to="/" className="logo">MiniEvents</Link>
                    <ul>
                        <li><button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px' }}>{darkMode ? '☀️' : '🌙'}</button></li>
                        <li><Link to="/">Events</Link></li>
                        {user ? (
                            <>
                                <li><Link to="/my-dashboard">My Dashboard</Link></li>
                                <li><Link to="/create-event">Create Event</Link></li>
                                <li>
                                    <button onClick={onLogout}>
                                        Logout ({user.email ? user.email.split('@')[0] : 'User'})
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/register">Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
            <main className="container">
                {children}
            </main>
        </>
    );
};

export default Layout;
