const fs = require('fs');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:5000/api';
const AUTH_URL = `${BASE_URL}/auth`;
const EVENTS_URL = `${BASE_URL}/events`;

const testImagePath = 'test-image-rsvp.png';

// Setup utilities
async function createTestImage() {
    const pngBuffer = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2D340000000049454E44AE426082', 'hex');
    fs.writeFileSync(testImagePath, pngBuffer);
}

async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function registerUser(email) {
    const res = await fetchJson(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
    });
    if (res.status === 201) return res.data.token;
    console.error(`Registration FAILED. Status: ${res.status}, Data:`, JSON.stringify(res.data));
    throw new Error(`Register failed for ${email}`);
}

async function rsvpTest() {
    try {
        await createTestImage();
        console.log('--- Starting RSVP Verification ---');

        // 1. Setup Users
        const ownerToken = await registerUser(`owner_${Date.now()}@test.com`);
        const user1Token = await registerUser(`rsvp_user1_${Date.now()}@test.com`);
        const user2Token = await registerUser(`rsvp_user2_${Date.now()}@test.com`);
        const user3Token = await registerUser(`rsvp_user3_${Date.now()}@test.com`);
        console.log('✅ Users Registered');

        // 2. Create Event (Capacity 2)
        const form = new FormData();
        form.append('title', 'Limited Capacity Party');
        form.append('description', 'Capacity 2');
        form.append('date', new Date().toISOString());
        form.append('location', 'Room A');
        form.append('capacity', '2'); // Strict Limit
        form.append('image', fs.createReadStream(testImagePath));

        const createRes = await fetch(EVENTS_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${ownerToken}`, ...form.getHeaders() },
            body: form,
            duplex: 'half'
        });
        const text = await createRes.text();
        let createData;
        try {
            createData = JSON.parse(text);
        } catch (e) {
            console.error('❌ Event Create Failed (Not JSON). Status:', createRes.status);
            console.error('Response:', text);
            throw new Error('Event Create returned Invalid JSON');
        }
        const eventId = createData.data._id;
        console.log(`✅ Event Created (ID: ${eventId}, Capacity: 2)`);

        // 3. User 1 RSVP
        const rsvp1Stats = await fetchJson(`${EVENTS_URL}/${eventId}/rsvp`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${user1Token}` }
        });
        if (rsvp1Stats.status === 200) console.log('✅ User 1 RSVP Successful');
        else throw new Error('User 1 RSVP Failed');

        // 4. User 1 Same RSVP (Duplicate Check)
        const rsvpDupStats = await fetchJson(`${EVENTS_URL}/${eventId}/rsvp`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${user1Token}` }
        });
        if (rsvpDupStats.status === 400) console.log('✅ Duplicate RSVP Blocked Correctly');
        else console.error(`❌ Duplicate RSVP NOT Blocked (Status: ${rsvpDupStats.status})`);

        // 5. User 2 RSVP
        const rsvp2Stats = await fetchJson(`${EVENTS_URL}/${eventId}/rsvp`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${user2Token}` }
        });
        if (rsvp2Stats.status === 200) console.log('✅ User 2 RSVP Successful');
        else throw new Error('User 2 RSVP Failed');

        // 6. User 3 RSVP (Should Fail - Capacity Full)
        const rsvp3Stats = await fetchJson(`${EVENTS_URL}/${eventId}/rsvp`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${user3Token}` }
        });
        if (rsvp3Stats.status === 400) console.log('✅ Full Capacity RSVP Blocked Correctly');
        else console.error(`❌ Full Capacity RSVP NOT Blocked (Status: ${rsvp3Stats.status})`);

        // 7. User 1 Leave
        const leaveStats = await fetchJson(`${EVENTS_URL}/${eventId}/rsvp`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user1Token}` }
        });
        if (leaveStats.status === 200) console.log('✅ User 1 Left Event');
        else throw new Error('User 1 Leave Failed');

        // 8. User 3 RSVP Retry (Should Succeed now)
        const rsvp3Retry = await fetchJson(`${EVENTS_URL}/${eventId}/rsvp`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${user3Token}` }
        });
        if (rsvp3Retry.status === 200) console.log('✅ User 3 RSVP Success after slot freed');
        else console.error(`❌ User 3 Retry Failed: ${JSON.stringify(rsvp3Retry.data)}`);

        // 9. Verify Final Count
        const getEventRes = await fetchJson(`${EVENTS_URL}/${eventId}`);
        // We removed attendeeCount from the public response in controller, let's see what we get.
        // Wait, I updated code to return attendeeCount.
        // Actually I mapped it in getEvents, but also in getEvent?
        // Let's check getEvent logic: "event.attendeeCount = event.attendees.length; delete event.attendees;"
        // YES.
        if (getEventRes.data.attendeeCount === 2) {
            console.log('✅ Final Attendee Count Correct (2)');
        } else {
            console.error(`❌ Incorrect Count: ${getEventRes.data.attendeeCount}`);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
        console.log('\n--- Verification Complete ---');
    }
}

rsvpTest();
