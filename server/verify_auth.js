// Using global fetch (Node 18+)


const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
    console.log('--- Starting Auth Verification ---');

    // Generate unique email
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';
    let token;

    // 1. Register User
    try {
        console.log(`\n1. Testing Registration (${email})...`);
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const regData = await regRes.json();

        if (regRes.status === 201 && regData.token) {
            console.log('✅ Registration Successful');
            token = regData.token;
        } else {
            console.error('❌ Registration Failed:', regData);
            process.exit(1);
        }
    } catch (err) {
        console.error('❌ Registration Error:', err);
        process.exit(1);
    }

    // 2. Duplicate Registration
    try {
        console.log('\n2. Testing Duplicate Registration...');
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const regData = await regRes.json();

        if (regRes.status === 400) {
            console.log('✅ Duplicate Registration Blocked Correctly');
        } else {
            console.error('❌ Duplicate Registration Failed to Block:', regData);
        }
    } catch (err) {
        console.error('❌ Duplicate Registration Error:', err);
    }

    // 3. Login
    try {
        console.log('\n3. Testing Login...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();

        if (loginRes.status === 200 && loginData.token) {
            console.log('✅ Login Successful');
        } else {
            console.error('❌ Login Failed:', loginData);
        }
    } catch (err) {
        console.error('❌ Login Error:', err);
    }

    // 4. Protected Route (Valid Token)
    try {
        console.log('\n4. Testing Protected Route (Valid Token)...');
        const meRes = await fetch(`${BASE_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const meData = await meRes.json();

        if (meRes.status === 200 && meData.data.email === email) {
            console.log('✅ Protected Route Accessible');
        } else {
            console.error('❌ Protected Route Access Failed:', meData);
        }
    } catch (err) {
        console.error('❌ Protected Route Error:', err);
    }

    // 5. Protected Route (No Token)
    try {
        console.log('\n5. Testing Protected Route (No Token)...');
        const meRes = await fetch(`${BASE_URL}/me`, {
            method: 'GET'
        });

        if (meRes.status === 401) {
            console.log('✅ Protected Route Blocked Correctly');
        } else {
            console.error('❌ Protected Route Failed to Block');
        }
    } catch (err) {
        console.error('❌ Protected Route Blocking Error:', err);
    }

    console.log('\n--- Verification Complete ---');
}

testAuth();
