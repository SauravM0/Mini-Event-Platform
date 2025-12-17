import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Other',
        description: '',
        date: '',
        location: '',
        capacity: ''
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState('');
    const [aiError, setAiError] = useState('');

    const navigate = useNavigate();

    const { title, description, date, location, capacity } = formData;

    const [validationErrors, setValidationErrors] = useState({});

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (validationErrors[e.target.name]) {
            setValidationErrors({ ...validationErrors, [e.target.name]: '' });
        }
    };
    const onFileChange = e => setImage(e.target.files[0]);

    const validate = () => {
        const errors = {};
        if (!title.trim()) errors.title = 'Title is required';
        if (!description.trim()) errors.description = 'Description is required';
        if (!location.trim()) errors.location = 'Location is required';
        if (!date) {
            errors.date = 'Date is required';
        } else if (new Date(date) <= new Date()) {
            errors.date = 'Event date must be in the future';
        }
        if (!capacity || capacity <= 0) errors.capacity = 'Capacity must be a positive number';
        if (!image) errors.image = 'Event image is required';

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAiGenerate = async () => {
        if (!title) {
            setAiError('Please enter a title first.');
            return;
        }
        setAiLoading(true);
        setAiError('');
        try {
            const res = await api.post('/ai/generate-description', {
                title,
                draftDescription: description
            });
            setFormData(prev => ({ ...prev, description: res.data.description }));
            // Clear description error if it existed
            if (validationErrors.description) {
                setValidationErrors(prev => ({ ...prev, description: '' }));
            }
        } catch (err) {
            console.error(err);
            setAiError('Could not generate description. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    const onSubmit = async e => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('title', title);
        data.append('category', formData.category || 'Other');
        data.append('description', description);
        data.append('date', date);
        data.append('location', location);
        data.append('capacity', capacity);
        data.append('image', image);

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

    const ErrorText = ({ msg }) => msg ? <small style={{ color: '#e74c3c', display: 'block', marginTop: '5px' }}>{msg}</small> : null;

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h1 className="text-center my-1">Create Event</h1>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Event Title <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" name="title" value={title} onChange={onChange} maxLength="100" style={validationErrors.title ? { borderColor: '#e74c3c' } : {}} />
                    <ErrorText msg={validationErrors.title} />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={onChange}>
                        {['Conference', 'Workshop', 'Meetup', 'Party', 'Sports', 'Music', 'Other'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Description <span style={{ color: 'red' }}>*</span></label>
                        <button
                            type="button"
                            onClick={handleAiGenerate}
                            disabled={aiLoading}
                            style={{
                                background: 'none',
                                border: '1px solid #ccc',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                color: aiLoading ? '#999' : 'inherit'
                            }}
                        >
                            {aiLoading ? '✨ Generating...' : '✨ Generate with AI'}
                        </button>
                    </div>
                    {aiError && <small style={{ color: 'red', display: 'block', marginBottom: '5px' }}>{aiError}</small>}
                    <textarea name="description" value={description} onChange={onChange} maxLength="500" rows="4" style={validationErrors.description ? { borderColor: '#e74c3c' } : {}}></textarea>
                    <ErrorText msg={validationErrors.description} />
                </div>

                <div className="form-group">
                    <label>Date & Time <span style={{ color: 'red' }}>*</span></label>
                    <input type="datetime-local" name="date" value={date} onChange={onChange} style={validationErrors.date ? { borderColor: '#e74c3c' } : {}} />
                    <ErrorText msg={validationErrors.date} />
                </div>

                <div className="form-group">
                    <label>Location <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" name="location" value={location} onChange={onChange} style={validationErrors.location ? { borderColor: '#e74c3c' } : {}} />
                    <ErrorText msg={validationErrors.location} />
                </div>

                <div className="form-group">
                    <label>Capacity <span style={{ color: 'red' }}>*</span></label>
                    <input type="number" name="capacity" value={capacity} onChange={onChange} min="1" style={validationErrors.capacity ? { borderColor: '#e74c3c' } : {}} />
                    <ErrorText msg={validationErrors.capacity} />
                </div>

                <div className="form-group">
                    <label>Event Image <span style={{ color: 'red' }}>*</span></label>
                    <input type="file" name="image" onChange={onFileChange} accept="image/*" />
                    <ErrorText msg={validationErrors.image} />
                </div>

                <button type="submit" className={`btn btn-block ${loading ? 'btn-disabled' : ''}`} disabled={loading}>
                    {loading ? 'Creating Event...' : 'Create Event'}
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;
