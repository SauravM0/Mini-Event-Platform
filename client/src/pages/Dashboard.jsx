import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        title: '',
        category: 'All',
        date: ''
    });

    useEffect(() => {
        fetchEvents();
    }, [filters]); // Re-fetch when filters change (debouncing could be added for title, but keeping simple as per instructions "trigger via query params")

    const fetchEvents = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.title) params.append('title', filters.title);
            if (filters.category && filters.category !== 'All') params.append('category', filters.category);
            if (filters.date) params.append('date', filters.date);

            const res = await api.get(`/events?${params.toString()}`);
            setEvents(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({ title: '', category: 'All', date: '' });
    };

    if (loading) return <div className="loading">Loading Events...</div>;

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/300?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        const filename = imagePath.split('/').pop().split('\\').pop();
        return `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/uploads/${filename}`;
    };

    return (
        <>
            <h1 className="my-2">Upcoming Events</h1>

            <div className="card" style={{ padding: '15px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    name="title"
                    placeholder="Search by title..."
                    value={filters.title}
                    onChange={handleFilterChange}
                    style={{ flex: 1, minWidth: '200px', margin: 0 }}
                />
                <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    style={{ flex: 1, minWidth: '150px', margin: 0 }}
                >
                    <option value="All">All Categories</option>
                    {['Conference', 'Workshop', 'Meetup', 'Party', 'Sports', 'Music', 'Other'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    style={{ flex: 1, minWidth: '150px', margin: 0 }}
                />
                <button onClick={clearFilters} className="btn btn-light" style={{ margin: 0, whiteSpace: 'nowrap' }}>
                    Clear Filters
                </button>
            </div>

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
                                <small className="badge" style={{ backgroundColor: '#f4f4f4', color: '#333', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', marginBottom: '5px', display: 'inline-block' }}>
                                    {event.category || 'Other'}
                                </small>
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
