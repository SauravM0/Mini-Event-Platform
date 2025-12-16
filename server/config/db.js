const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Don't exit process in dev if possible, but for setup validation it's good to know.
        // For now, we just log it. server.js will connect on start.
        // process.exit(1); 
    }
};

module.exports = connectDB;
