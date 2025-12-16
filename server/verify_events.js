const fs = require('fs');
const FormData = require('form-data');
// Fetch is global in Node 18+
// const fetch = require('node-fetch'); 

const BASE_URL = 'http://localhost:5000/api';
const AUTH_URL = `${BASE_URL}/auth`;
const EVENTS_URL = `${BASE_URL}/events`;

const testImagePath = 'test-image.png';

async function createTestImage() {
    // Minimal 1x1 PNG
    const pngBuffer = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2D340000000049454E44AE426082', 'hex');
    fs.writeFileSync(testImagePath, pngBuffer);
}

async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function runTest() {
    try {
        await createTestImage();
        console.log('--- Starting Event CRUD Verification ---');

        // 1. Register User 1
        const email1 = `user1_${Date.now()}@test.com`;
        const password = 'password123';
        console.log(`\n1. Registering User 1 (${email1})...`);

        let res = await fetchJson(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email1, password })
        });

        if (res.status !== 201) {
            throw new Error(`User 1 Registration Failed: ${JSON.stringify(res.data)}`);
        }
        const token1 = res.data.token;
        console.log('✅ User 1 Registered');

        // 2. Register User 2
        const email2 = `user2_${Date.now()}@test.com`;
        console.log(`\n2. Registering User 2 (${email2})...`);
        res = await fetchJson(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email2, password })
        });
        const token2 = res.data.token;
        console.log('✅ User 2 Registered');

        // 3. Create Event (User 1)
        console.log('\n3. Creating Event (User 1)...');
        const form = new FormData();
        form.append('title', 'Summer Concert');
        form.append('description', 'A great summer concert');
        form.append('date', new Date().toISOString());
        form.append('location', 'Central Park');
        form.append('capacity', '100');
        form.append('image', fs.createReadStream(testImagePath));

        // Use standard fetch but with headers from form-data
        // Note: node-fetch/global fetch integration with form-data lib requires header tweaking
        const createRes = await fetch(EVENTS_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token1}`,
                ...form.getHeaders()
            },
            body: form
        });

        const createData = await createRes.json();

        if (createRes.status !== 201) {
            throw new Error(`Create Event Failed: ${JSON.stringify(createData)}`);
        }
        const eventId = createData.data._id;
        console.log('✅ Event Created:', eventId);

        // 4. Get All Events
        console.log('\n4. Getting All Events...');
        res = await fetchJson(EVENTS_URL);
        if (res.status === 200 && res.data.count >= 1) {
            console.log('✅ Events Retrieved Correctly');
        } else {
            throw new Error('Failed to retrieve events');
        }

        // 5. Update Event (User 2 - Should Fail)
        console.log('\n5. Attempting Update by Non-Owner (User 2)...');
        const updateFormFail = new FormData();
        updateFormFail.append('title', 'Hacked Title');

        const updateFailRes = await fetch(`${EVENTS_URL}/${eventId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token2}`,
                ...updateFormFail.getHeaders()
            },
            body: updateFormFail
        });

        if (updateFailRes.status === 401) {
            console.log('✅ Unauthorized Update Blocked');
        } else {
            console.error(`❌ Unauthorized Update NOT Blocked (Status: ${updateFailRes.status})`);
        }

        // 6. Update Event (User 1 - Should Sustain)
        console.log('\n6. Updating Event by Owner (User 1)...');
        const updateForm = new FormData();
        updateForm.append('title', 'Updated Concert Title');

        const updateRes = await fetch(`${EVENTS_URL}/${eventId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token1}`,
                ...updateForm.getHeaders()
            },
            body: updateForm
        });

        const updateData = await updateRes.json();
        if (updateRes.status === 200 && updateData.data.title === 'Updated Concert Title') {
            console.log('✅ Owner Update Successful');
        } else {
            console.error(`❌ Owner Update Failed (Status: ${updateRes.status})`, updateData);
        }

        // 7. Delete Event (User 2 - Should Fail)
        console.log('\n7. Attempting Delete by Non-Owner (User 2)...');
        const deleteFailRes = await fetch(`${EVENTS_URL}/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token2}`
            }
        });

        if (deleteFailRes.status === 401) {
            console.log('✅ Unauthorized Delete Blocked');
        } else {
            console.error(`❌ Unauthorized Delete NOT Blocked (Status: ${deleteFailRes.status})`);
        }

        // 8. Delete Event (User 1 - Should Succeed)
        console.log('\n8. Deleting Event by Owner (User 1)...');
        const deleteRes = await fetch(`${EVENTS_URL}/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token1}`
            }
        });

        if (deleteRes.status === 200) {
            console.log('✅ Owner Delete Successful');
        } else {
            console.error(`❌ Owner Delete Failed (Status: ${deleteRes.status})`);
        }

    } catch (err) {
        console.error('❌ Error during verification:', err.message);
    } finally {
        if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
        console.log('\n--- Verification Complete ---');
    }
}

runTest();
