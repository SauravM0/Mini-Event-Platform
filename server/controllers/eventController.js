const Event = require('../models/Event');
const fs = require('fs');
const path = require('path');

// @desc    Create new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image' });
        }

        // Add user and image to body
        req.body.createdBy = req.user.id;

        // Normalize path to use forward slashes for URLs, regardless of OS
        const normalizedPath = req.file.path.replace(/\\/g, '/');
        req.body.image = normalizedPath;

        const event = await Event.create(req.body);

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (err) {
        console.error(err);
        // Remove uploaded file if validation failed
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, errors: messages });
        }

        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get user events
// @route   GET /api/events/my-events
// @access  Private
exports.getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user.id })
            .sort({ date: 1 })
            .lean();

        const eventsWithCount = events.map(event => ({
            ...event,
            attendeeCount: event.attendees ? event.attendees.length : 0,
            attendees: undefined
        }));

        res.status(200).json({
            success: true,
            count: eventsWithCount.length,
            data: eventsWithCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get user RSVPs
// @route   GET /api/events/my-rsvps
// @access  Private
exports.getMyRSVPs = async (req, res) => {
    try {
        const events = await Event.find({ attendees: req.user.id })
            .sort({ date: 1 })
            .populate('createdBy', 'email')
            .lean();

        const eventsWithCount = events.map(event => ({
            ...event,
            attendeeCount: event.attendees ? event.attendees.length : 0,
            attendees: undefined,
            isRsvped: true
        }));

        res.status(200).json({
            success: true,
            count: eventsWithCount.length,
            data: eventsWithCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
    try {
        const { title, category, date } = req.query;
        let query = {};

        // Search by Title (Case Insensitive)
        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }

        // Filter by Category
        if (category && category !== 'All') {
            query.category = category;
        }

        // Filter by Date
        if (date) {
            // Selected Date: Match entire day
            const selectedDate = new Date(date);
            const nextDay = new Date(selectedDate);
            nextDay.setDate(selectedDate.getDate() + 1);

            query.date = {
                $gte: selectedDate,
                $lt: nextDay
            };
        } else {
            // Default: Upcoming events only (including today)
            // Using a slightly past time to include current events that might have just started
            query.date = { $gte: new Date() };
        }

        const events = await Event.find(query)
            .sort({ date: 1 })
            .populate('createdBy', 'email')
            .lean();

        // Calculate attendee count and hide raw array
        const eventsWithCount = events.map(event => ({
            ...event,
            attendeeCount: event.attendees ? event.attendees.length : 0,
            attendees: undefined
        }));

        res.status(200).json({
            success: true,
            count: eventsWithCount.length,
            data: eventsWithCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'email')
            .lean();

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        event.attendeeCount = event.attendees ? event.attendees.length : 0;

        // Check for isRsvped if token is present
        let isRsvped = false;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            try {
                const jwt = require('jsonwebtoken'); // Lazy load or move to top
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (event.attendees && event.attendees.map(id => id.toString()).includes(decoded.id)) {
                    isRsvped = true;
                }
            } catch (ignore) {
                // Invalid token, treat as guest
            }
        }
        event.isRsvped = isRsvped;

        delete event.attendees;

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (err) {
        console.error(err);
        if (err.name === 'CastError') {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Make sure user is event owner
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this event' });
        }

        // Handle Image upload if present
        if (req.file) {
            // Delete old image
            if (fs.existsSync(event.image)) {
                fs.unlinkSync(event.image);
            }
            // Normalize path
            const normalizedPath = req.file.path.replace(/\\/g, '/');
            req.body.image = normalizedPath;
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (err) {
        console.error(err);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Make sure user is event owner
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this event' });
        }

        // Delete image file
        if (fs.existsSync(event.image)) {
            fs.unlinkSync(event.image);
        }

        await event.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(err);
        if (err.name === 'CastError') {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    RSVP to an event
// @route   POST /api/events/:id/rsvp
// @access  Private
exports.rsvpEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        const eventCheck = await Event.findById(eventId);
        if (!eventCheck) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (eventCheck.attendees.includes(userId)) {
            return res.status(400).json({ success: false, message: 'Already RSVPed to this event' });
        }

        // Atomic Update with Capacity Check
        const event = await Event.findOneAndUpdate(
            {
                _id: eventId,
                $expr: { $lt: [{ $size: "$attendees" }, "$capacity"] }
            },
            {
                $addToSet: { attendees: userId }
            },
            { new: true }
        );

        if (!event) {
            return res.status(400).json({ success: false, message: 'Event is full' });
        }

        res.status(200).json({
            success: true,
            data: event
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Cancel RSVP
// @route   DELETE /api/events/:id/rsvp
// @access  Private
exports.cancelRsvp = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { $pull: { attendees: req.user.id } },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
