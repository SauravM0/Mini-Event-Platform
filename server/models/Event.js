const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    category: {
        type: String,
        enum: ['Conference', 'Workshop', 'Meetup', 'Party', 'Sports', 'Music', 'Other'],
        default: 'Other',
        index: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    date: {
        type: Date,
        required: [true, 'Please add a date and time'],
        index: true
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    capacity: {
        type: Number,
        required: [true, 'Please add capacity'],
        min: [1, 'Capacity must be at least 1']
    },
    image: {
        type: String,
        required: [true, 'Please add an image']
    },
    attendees: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    createdBy: {

        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
EventSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Event', EventSchema);
