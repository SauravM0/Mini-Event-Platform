import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading Events...</div>;

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/300?text=No+Image';
        // If it starts with http, return as is (for external links if any)
        if (imagePath.startsWith('http')) return imagePath;
        // Otherwise assume relative to server uploads
        // Need to handle backslashes from windows paths just in case, though server normalizes it.
        // Also remove 'uploads/' prefix if redundant depending on how static serve is set up?
        // Server: app.use('/uploads', express.static(... 'uploads'))
        // So http://localhost:5000/uploads/filename.jpg
        const filename = imagePath.split('/').pop().split('\\').pop();
        return `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/uploads/${filename}`;
    };

    return (
        <>
            <h1 className="my-2">Upcoming Events</h1>
            {events.length === 0 ? (
                <p>No events found.</p>
            ) : (
                <div className="events-grid">
                    {events.map(event => {
                        const isFull = event.attendeeCount >= event.capacity;

                        return (
                            <div key={event._id} className="card event-card">
                                <img src={getImageUrl(event.image)} alt={event.title} />
                                <h3>{event.title}</h3>
                                <p className="mb-1" style={{ color: '#666', fontSize: '0.9rem' }}>
                                    {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="mb-1">📍 {event.location}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                    <span className={`badge ${isFull ? 'badge-danger' : 'badge-success'}`}>
                                        {isFull ? 'FULL' : `${event.capacity - event.attendeeCount} spots left`}
                                    </span>
                                    <Link to={`/events/${event._id}`} className="btn">View Details</Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default Dashboard;
