require('dotenv').config();
const { generateEventDescription } = require('./services/aiService');

async function testAI() {
    try {
        console.log('Testing AI Service with gemini-1.5-pro...');
        const description = await generateEventDescription('Tech Meetup 2025', 'A gathering of tech enthusiasts.');
        console.log('Success! Generated Description:');
        console.log(description);
    } catch (error) {
        console.error('AI Service Test Failed:', error.message);
    }
}

testAI();
