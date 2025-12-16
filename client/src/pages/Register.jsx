import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passError, setPassError] = useState('');

    const { register, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password, confirmPassword } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'confirmPassword' || e.target.name === 'password') {
            setPassError(''); // Clear custom pass error on type
        }
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPassError('Passwords do not match');
            return;
        }

        const success = await register(email, password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <h1 className="text-center my-1">Register</h1>
            {(error || passError) && <div className="error-msg">{error || passError}</div>}
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                        minLength="6"
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={onChange}
                        required
                        minLength="6"
                    />
                </div>
                <button type="submit" className="btn btn-block">Register</button>
            </form>
        </div>
    );
};

export default Register;
