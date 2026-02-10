
const BASE_URL = 'http://localhost:3000/api';

async function testEndpoint(name, url, method = 'GET', body = null) {
    console.log(`\nTesting ${name} [${method} ${url}]...`);
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);

        const start = Date.now();
        const res = await fetch(`${BASE_URL}${url}`, options);
        const duration = Date.now() - start;

        console.log(`Status: ${res.status} (${res.statusText}) - ${duration}ms`);

        if (res.ok) {
            const data = await res.json();
            // console.log('Response:', JSON.stringify(data).substring(0, 100) + '...');
            console.log('Response Type:', Array.isArray(data) ? `Array[${data.length}]` : typeof data);
            return data;
        } else {
            const text = await res.text();
            console.error('Error Body:', text);
            return null;
        }
    } catch (err) {
        console.error('Fetch Failed:', err.message);
        return null;
    }
}

async function runTests() {
    console.log('Starting Backend Verification...');

    // 1. Stats
    await testEndpoint('Stats', '/stats');

    // 2. Alerts
    await testEndpoint('Alerts', '/alerts');

    // 3. Requests (GET)
    const requests = await testEndpoint('Get Requests', '/requests');

    // 4. Requests (POST) - Create a dummy request
    const newRequest = await testEndpoint('Create Request', '/requests', 'POST', {
        title: 'Backend Test Request',
        description: 'Auto-generated test request',
        type: 'MEDICINE',
        urgency: 'LOW',
        location: 'Test City',
        contact: '9998887776'
    });

    let requestId = newRequest?.id || (requests && requests[0]?.id);

    if (requestId) {
        // 5. Request By ID
        await testEndpoint('Get Request By ID', `/requests/${requestId}`);

        // Cleanup Request 
        // Note: DELETE might not be implemented in all routes based on previous file list Check
        // await testEndpoint('Delete Request', `/requests/${requestId}`, 'DELETE');
    }

    // 6. Resources (GET)
    const resources = await testEndpoint('Get Resources', '/resources');

    // 7. Resources (POST)
    const newResource = await testEndpoint('Create Resource', '/resources', 'POST', {
        title: 'Backend Test Resource',
        type: 'OXYGEN',
        location: { lat: 12.0, lng: 77.0, address: 'Test Addr', city: 'Test City', district: 'Test Dist' },
        contact: { phone: '1112223334' },
        status: 'AVAILABLE'
    });

    let resourceId = newResource?.id || (resources && resources[0]?.id);

    if (resourceId) {
        // 8. Resource By ID
        await testEndpoint('Get Resource By ID', `/resources/${resourceId}`);

        // 9. Report Resource
        await testEndpoint('Report Resource', `/resources/${resourceId}/report`, 'POST');

        // 10. Delete Resource (if implemented)
        // await testEndpoint('Delete Resource', `/resources/${resourceId}`, 'DELETE');
    }

    // 11. Chat (Simulated)
    await testEndpoint('Chat', '/chat', 'POST', {
        message: 'Hello, are there any oxygen cylinders?',
        history: []
    });

    // 12. Volunteer Tasks
    // await testEndpoint('Volunteer Tasks', '/volunteer/tasks'); // Might verify volunteer session, so it might fail 401/403

    console.log('\nBackend Verification Complete.');
}

runTests();
