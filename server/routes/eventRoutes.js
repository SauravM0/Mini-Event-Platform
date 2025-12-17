const express = require('express');
const {
    createEvent,
    getEvents,
    getMyEvents,
    getMyRSVPs,
    getEvent,
    updateEvent,
    deleteEvent,
    rsvpEvent,
    cancelRsvp
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/my-events')
    .get(protect, getMyEvents);

router.route('/my-rsvps')
    .get(protect, getMyRSVPs);

router.route('/')
    .get(getEvents)
    .post(protect, upload.single('image'), createEvent);

router.route('/:id')
    .get(getEvent)
    .put(protect, upload.single('image'), updateEvent)
    .delete(protect, deleteEvent);

router.route('/:id/rsvp')
    .post(protect, rsvpEvent)
    .delete(protect, cancelRsvp);

module.exports = router;
