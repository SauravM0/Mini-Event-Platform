import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const EventDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            // Token is auto-injected by interceptor if present
            const res = await api.get(`/events/${id}`);
            setEvent(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!user) return navigate('/login');
        setRsvpLoading(true);
        try {
            await api.post(`/events/${id}/rsvp`);
            setMsg('Joined successfully!');
            fetchEvent(); // Refresh to update count and status
        } catch (err) {
            setMsg(err.response?.data?.message || 'Failed to join');
        } finally {
            setRsvpLoading(false);
        }
    };

    const handleLeave = async () => {
        setRsvpLoading(true);
        try {
            await api.delete(`/events/${id}/rsvp`);
            setMsg('Left event successfully.');
            fetchEvent();
        } catch (err) {
            setMsg('Failed to leave');
        } finally {
            setRsvpLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure? This cannot be undone.')) return;
        try {
            await api.delete(`/events/${id}`);
            navigate('/');
        } catch (err) {
            setMsg('Failed to delete event');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!event) return <div className="error-msg">Event not found</div>;

    const isFull = event.attendeeCount >= event.capacity;
    const isOwner = user && event.createdBy._id === user.id;
    const isRsvped = event.isRsvped;

    // Formatting
    const dateStr = new Date(event.date).toLocaleDateString();
    const timeStr = new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        const filename = imagePath.split('/').pop().split('\\').pop();
        return `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/uploads/${filename}`;
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <Link to="/" className="btn" style={{ marginBottom: '1rem', background: '#777' }}>Back to Events</Link>

            <div className="card">
                <img
                    src={getImageUrl(event.image)}
                    alt={event.title}
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                />

                <h1>{event.title}</h1>
                <p style={{ color: '#666', marginBottom: '1rem' }}>Hosted by: {event.createdBy.email}</p>

                {msg && <div className={`badge ${msg.includes('Fail') ? 'badge-danger' : 'badge-success'}`} style={{ display: 'inline-block', marginBottom: '1rem', fontSize: '1rem' }}>{msg}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3>Description</h3>
                        <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{event.description}</p>
                    </div>

                    <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <h3>Event Details</h3>
                        <p className="my-1"><strong>📅 Date:</strong> {dateStr} at {timeStr}</p>
                        <p className="my-1"><strong>📍 Location:</strong> {event.location}</p>
                        <p className="my-1"><strong>👥 Capacity:</strong> {event.attendeeCount} / {event.capacity}</p>

                        <div style={{ marginTop: '2rem' }}>
                            {isOwner ? (
                                <button onClick={handleDelete} className="btn btn-danger btn-block">Delete Event</button>
                            ) : (
                                <>
                                    {isRsvped ? (
                                        <button onClick={handleLeave} className="btn btn-danger btn-block" disabled={rsvpLoading}>
                                            {rsvpLoading ? 'Processing...' : 'Leave Event'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleJoin}
                                            className={`btn btn-block ${isFull ? 'btn-disabled' : 'btn-success'}`}
                                            disabled={isFull || rsvpLoading}
                                        >
                                            {rsvpLoading ? 'Processing...' : (isFull ? 'Event Full' : 'Join Event')}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Re-import Link as it was missing in the top block
import { Link } from 'react-router-dom';

export default EventDetail;
