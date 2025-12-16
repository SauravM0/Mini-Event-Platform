import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        capacity: ''
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const { title, description, date, location, capacity } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onFileChange = e => setImage(e.target.files[0]);

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('title', title);
        data.append('description', description);
        data.append('date', date);
        data.append('location', location);
        data.append('capacity', capacity);
        if (image) {
            data.append('image', image);
        } else {
            setError('Please upload an image');
            setLoading(false);
            return;
        }

        try {
            await api.post('/events', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate('/');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Error creating event';
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h1 className="text-center my-1">Create Event</h1>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Event Title</label>
                    <input type="text" name="title" value={title} onChange={onChange} required maxLength="100" />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={description} onChange={onChange} required maxLength="500" rows="4"></textarea>
                </div>

                <div className="form-group">
                    <label>Date & Time</label>
                    <input type="datetime-local" name="date" value={date} onChange={onChange} required />
                </div>

                <div className="form-group">
                    <label>Location</label>
                    <input type="text" name="location" value={location} onChange={onChange} required />
                </div>

                <div className="form-group">
                    <label>Capacity</label>
                    <input type="number" name="capacity" value={capacity} onChange={onChange} required min="1" />
                </div>

                <div className="form-group">
                    <label>Event Image</label>
                    <input type="file" name="image" onChange={onFileChange} required accept="image/*" />
                </div>

                <button type="submit" className={`btn btn-block ${loading ? 'btn-disabled' : ''}`} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Event'}
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;
