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
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await api.get(`/events/${id}`);
            setEvent(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Event not found');
            setLoading(false);
        }
    };

    const handleRsvp = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setRsvpLoading(true);
        setSuccessMsg('');
        try {
            const res = await api.post(`/events/${id}/rsvp`);
            setEvent({ ...event, attendees: [...(event.attendees || []), user._id], attendeeCount: event.attendeeCount + 1, isRsvped: true });
            setSuccessMsg('Successfully RSVPed!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error processing RSVP');
        } finally {
            setRsvpLoading(false);
        }
    };

    const handleCancelRsvp = async () => {
        if (!window.confirm('Cancel your RSVP?')) return;
        setRsvpLoading(true);
        setSuccessMsg('');
        try {
            await api.delete(`/events/${id}/rsvp`);
            setEvent({ ...event, attendeeCount: event.attendeeCount - 1, isRsvped: false });
            setSuccessMsg('RSVP Cancelled.');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error processing request');
        } finally {
            setRsvpLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await api.delete(`/events/${id}`);
            navigate('/');
        } catch (err) {
            console.error(err);
            alert('Error deleting event');
        }
    };

    if (loading) return <div className="loading">Loading Event Details...</div>;
    if (error) return <div className="error-msg my-2">{error}</div>;
    if (!event) return null;

    const isFull = event.attendeeCount >= event.capacity;
    const isOwner = user && user._id === event.createdBy._id;

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/300?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        const filename = imagePath.split('/').pop().split('\\').pop();
        return `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/uploads/${filename}`;
    };

    return (
        <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <Link to="/" className="btn btn-light" style={{ marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to Events</Link>
            <img
                src={getImageUrl(event.image)}
                alt={event.title}
                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <h1 className="my-1">{event.title}</h1>

            {successMsg && <div className="success-msg" style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>{successMsg}</div>}

            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div>
                    <p className="lead" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{event.description}</p>
                    <p><strong>Category:</strong> {event.category || 'Other'}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</p>
                    <p><strong>Organizer:</strong> {event.createdBy.email}</p>
                </div>
                <div>
                    <div className="card" style={{ background: '#f4f4f4', padding: '15px' }}>
                        <h3>Event Status</h3>
                        <p className={`badge ${isFull ? 'badge-danger' : 'badge-success'}`} style={{ display: 'inline-block', marginTop: '10px', fontSize: '1rem' }}>
                            {isFull ? 'FULL' : 'OPEN'}
                        </p>
                        <p className="my-1">
                            {event.capacity - event.attendeeCount} spots left / {event.capacity} total
                        </p>

                        {!isOwner && (
                            event.isRsvped ? (
                                <button onClick={handleCancelRsvp} className="btn btn-danger btn-block" disabled={rsvpLoading}>
                                    {rsvpLoading ? 'Processing...' : 'Cancel RSVP'}
                                </button>
                            ) : (
                                <button onClick={handleRsvp} className={`btn btn-primary btn-block ${isFull ? 'btn-disabled' : ''}`} disabled={isFull || rsvpLoading}>
                                    {rsvpLoading ? 'Processing...' : (isFull ? 'Event Full' : 'Join Event')}
                                </button>
                            )
                        )}

                        {isOwner && (
                            <button onClick={handleDelete} className="btn btn-danger btn-block" style={{ marginTop: '10px' }}>
                                Delete Event
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Re-import Link as it was missing in the top block
import { Link } from 'react-router-dom';

export default EventDetail;
