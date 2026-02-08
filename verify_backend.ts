
const BASE_URL = 'http://localhost:3000';

async function verifyEndpoint(name: string, path: string, method: string = 'GET', body?: any) {
    try {
        const options: RequestInit = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) options.body = JSON.stringify(body);

        const start = performance.now();
        const res = await fetch(`${BASE_URL}${path}`, options);
        const duration = (performance.now() - start).toFixed(0);

        const statusIcon = res.ok ? '✅' : '❌';
        console.log(`${statusIcon} ${name.padEnd(20)} [${method} ${path}] - ${res.status} (${duration}ms)`);

        if (!res.ok) {
            console.error(`   Error: ${res.statusText}`);
            const text = await res.text();
            console.error(`   Body: ${text.slice(0, 200)}...`);
            return false;
        }

        const data = await res.json();
        const count = Array.isArray(data) ? data.length : (data.results ? data.results.length : (data.reply ? 'Reply Received' : 'Object'));
        console.log(`   Response: ${Array.isArray(data) ? `Array[${count}]` : JSON.stringify(data).slice(0, 60)}...`);
        return true;

    } catch (error) {
        console.log(`❌ ${name.padEnd(20)} - Connection Failed`);
        console.error(error);
        return false;
    }
}

async function run() {
    console.log('🚀 Starting Backend Verification...\n');

    // Wait for server to be ready (naive delay, assume manual wait or outside check)
    // In this script we assume server is running.

    const results = [];

    results.push(await verifyEndpoint('Resources', '/api/resources'));
    results.push(await verifyEndpoint('Requests', '/api/requests'));
    results.push(await verifyEndpoint('Alerts', '/api/alerts'));
    results.push(await verifyEndpoint('Volunteer Tasks', '/api/volunteer/tasks'));
    results.push(await verifyEndpoint('Stats', '/api/stats'));

    // Chat POST test
    results.push(await verifyEndpoint('Chat Bot', '/api/chat', 'POST', { message: 'I need oxygen' }));

    // Auth Session
    results.push(await verifyEndpoint('Auth Session', '/api/auth/session'));

    console.log('\n--------------------------------');
    const allPassed = results.every(r => r);
    if (allPassed) {
        console.log('🎉 All backend endpoints verified successfully!');
        process.exit(0);
    } else {
        console.error('⚠️ Some endpoints failed verification.');
        process.exit(1);
    }
}

run();
