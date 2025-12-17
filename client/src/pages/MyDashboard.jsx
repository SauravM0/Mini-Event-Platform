import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MyDashboard = () => {
    const [createdEvents, setCreatedEvents] = useState([]);
    const [rsvpEvents, setRsvpEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [createdRes, rsvpRes] = await Promise.all([
                api.get('/events/my-events'),
                api.get('/events/my-rsvps')
            ]);
            setCreatedEvents(createdRes.data.data);
            setRsvpEvents(rsvpRes.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch dashboard data');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event? This cannot be undone.')) {
            return;
        }
        try {
            await api.delete(`/events/${id}`);
            // Remove from list
            setCreatedEvents(createdEvents.filter(e => e._id !== id));
        } catch (err) {
            alert('Failed to delete event');
            console.error(err);
        }
    };

    const handleCancelRsvp = async (id) => {
        if (!window.confirm('Are you sure you want to cancel your RSVP?')) {
            return;
        }
        try {
            await api.delete(`/events/${id}/rsvp`);
            // Remove from list
            setRsvpEvents(rsvpEvents.filter(e => e._id !== id));
        } catch (err) {
            alert('Failed to cancel RSVP');
            console.error(err);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/300?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        const filename = imagePath.split('/').pop().split('\\').pop();
        return `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/uploads/${filename}`;
    };


    if (loading) return <div className="loading">Loading Dashboard...</div>;
    if (error) return <div className="error-msg my-2">{error}</div>;

    const EventList = ({ events, type }) => (
        <div className="events-grid">
            {events.map(event => (
                <div key={event._id} className="card event-card">
                    <img src={getImageUrl(event.image)} alt={event.title} />
                    <h3>{event.title}</h3>
                    <small className="badge" style={{ backgroundColor: '#f4f4f4', color: '#333', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', marginBottom: '5px', display: 'inline-block' }}>
                        {event.category || 'Other'}
                    </small>
                    <p className="mb-1" style={{ color: '#666', fontSize: '0.9rem' }}>
                        {new Date(event.date).toLocaleDateString()}
                    </p>
                    <div style={{ marginTop: '10px' }}>
                        <Link to={`/events/${event._id}`} className="btn btn-block" style={{ marginBottom: '5px', textAlign: 'center' }}>View Details</Link>
                        {type === 'created' ? (
                            <button
                                onClick={() => handleDelete(event._id)}
                                className="btn btn-danger btn-block"
                            >
                                Delete Event
                            </button>
                        ) : (
                            <button
                                onClick={() => handleCancelRsvp(event._id)}
                                className="btn btn-warning btn-block"
                                style={{ backgroundColor: '#f0ad4e', border: 'none' }}
                            >
                                Cancel RSVP
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div>
            <h1 className="my-2">My Dashboard</h1>

            <section className="my-2">
                <h2 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>My Created Events</h2>
                {createdEvents.length > 0 ? (
                    <EventList events={createdEvents} type="created" />
                ) : (
                    <p>You haven't created any events yet. <Link to="/create-event" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Create one now!</Link></p>
                )}
            </section>

            <section className="my-2" style={{ marginTop: '4rem' }}>
                <h2 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>Events I'm Attending</h2>
                {rsvpEvents.length > 0 ? (
                    <EventList events={rsvpEvents} type="rsvp" />
                ) : (
                    <p>You are not attending any upcoming events.</p>
                )}
            </section>
        </div>
    );
};

export default MyDashboard;
