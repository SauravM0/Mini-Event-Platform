const aiService = require('../services/aiService');

exports.generateDescription = async (req, res) => {
    const { title, draftDescription } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Event title is required.' });
    }

    try {
        const description = await aiService.generateEventDescription(title, draftDescription);
        res.json({ description });
    } catch (err) {
        // Log the actual error for server logs, but send a generic message to client unless it's a configuration error
        console.error(err.message);

        // Check if it's our specific config error
        if (err.message.includes("Server configuration error")) {
            return res.status(503).json({ message: "AI features are not currently configured on this server." });
        }

        res.status(500).json({ message: 'Could not generate description at this time.' });
    }
};
