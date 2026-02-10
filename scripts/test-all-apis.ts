/**
 * Comprehensive API Test with Proper NextAuth Authentication
 * Uses the working authentication flow from previous tests
 */

const baseUrl = 'http://localhost:3000';

interface TestResult {
    endpoint: string;
    method: string;
    status: number;
    success: boolean;
    error?: string;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
    results.push(result);
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.method} ${result.endpoint} - ${result.status}`);
    if (result.error) console.log(`   Error: ${result.error}`);
}

async function getAuthenticatedSession() {
    try {
        // 1. Get CSRF token
        const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
        const csrfData = await csrfRes.json();

        // 2. Login using credentials provider
        const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                csrfToken: csrfData.csrfToken,
                email: 'test@vita.com',
                password: 'password',
                json: 'true'
            })
        });

        // 3. Extract cookies
        const setCookieHeader = loginRes.headers.get('set-cookie') || '';
        const cookies = setCookieHeader.split(',').map(c => c.split(';')[0]).join('; ');

        return cookies;
    } catch (error) {
        console.error('Authentication failed:', error);
        return '';
    }
}

async function testEndpoint(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    cookies?: string
) {
    try {
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(cookies ? { 'Cookie': cookies } : {})
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const res = await fetch(`${baseUrl}${endpoint}`, options);
        const data = await res.json().catch(() => ({}));

        logResult({
            endpoint,
            method,
            status: res.status,
            success: res.ok,
            error: !res.ok ? data.error || JSON.stringify(data) : undefined
        });

        return { status: res.status, data };
    } catch (error: any) {
        logResult({
            endpoint,
            method,
            status: 0,
            success: false,
            error: error.message
        });
        return { status: 0, data: null };
    }
}

async function runTests() {
    console.log('🔍 Comprehensive Backend API Tests\n');
    console.log('Testing all endpoints with proper authentication...\n');

    // Get authenticated session
    console.log('🔐 Authenticating...');
    const authCookies = await getAuthenticatedSession();
    console.log(authCookies ? '✅ Authentication successful\n' : '❌ Authentication failed\n');

    // 1. Public Endpoints
    console.log('=== PUBLIC ENDPOINTS ===\n');

    await testEndpoint('/api/auth/csrf', 'GET');
    await testEndpoint('/api/auth/session', 'GET');
    await testEndpoint('/api/resources', 'GET');
    await testEndpoint('/api/resources?type=AMBULANCE', 'GET');
    await testEndpoint('/api/resources?lat=28.6139&lng=77.2090', 'GET');
    await testEndpoint('/api/stats', 'GET');
    await testEndpoint('/api/alerts', 'GET');
    await testEndpoint('/api/requests', 'GET');

    // 2. Resource Creation
    console.log('\n=== RESOURCE MANAGEMENT ===\n');

    const newResource = await testEndpoint('/api/resources', 'POST', {
        type: 'HOSPITAL',
        title: 'API Test Hospital',
        description: 'Created via automated test',
        lat: 28.6139,
        lng: 77.2090,
        address: 'Test Address, Delhi',
        city: 'Delhi',
        district: 'Central Delhi',
        contact: '9876543210',
        status: 'AVAILABLE'
    });

    // 3. Request Creation
    console.log('\n=== REQUEST MANAGEMENT ===\n');

    await testEndpoint('/api/requests', 'POST', {
        type: 'BLOOD',
        urgency: 'HIGH',
        description: 'Urgent blood requirement - API Test',
        contact: '9876543210',
        location: {
            lat: 28.6139,
            lng: 77.2090,
            address: 'Test Location, Delhi'
        }
    });

    // 4. Authenticated Endpoints
    console.log('\n=== AUTHENTICATED ENDPOINTS ===\n');

    // User contacts
    await testEndpoint('/api/user/contacts', 'GET', undefined, authCookies);
    await testEndpoint('/api/user/contacts', 'POST', {
        contacts: [
            { name: 'Emergency Contact 1', phone: '9876543210', relation: 'Family' },
            { name: 'Emergency Contact 2', phone: '8765432109', relation: 'Friend' }
        ]
    }, authCookies);

    // Verify contacts were saved
    await testEndpoint('/api/user/contacts', 'GET', undefined, authCookies);

    // SOS endpoint
    await testEndpoint('/api/sos/send', 'POST', {
        location: {
            lat: 28.6139,
            lng: 77.2090,
            address: 'Emergency Location - API Test'
        }
    }, authCookies);

    // Chat endpoint
    await testEndpoint('/api/chat', 'POST', {
        message: 'Test emergency assistance request'
    }, authCookies);

    // Volunteer tasks
    await testEndpoint('/api/volunteer/tasks', 'GET', undefined, authCookies);

    // 5. Location-Based Queries
    console.log('\n=== LOCATION-BASED QUERIES ===\n');

    await testEndpoint('/api/resources?lat=28.6139&lng=77.2090&type=AMBULANCE', 'GET');
    await testEndpoint('/api/resources?lat=28.6139&lng=77.2090&type=HOSPITAL', 'GET');
    await testEndpoint('/api/resources?lat=28.6139&lng=77.2090&type=BLOOD_BANK', 'GET');

    // Print Summary
    printSummary();
}

function printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL TEST SUMMARY');
    console.log('='.repeat(60));

    const total = results.length;
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const successRate = ((passed / total) * 100).toFixed(1);

    console.log(`\nTotal Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${successRate}%\n`);

    // Categorize results
    const publicEndpoints = results.filter(r => !r.endpoint.includes('/user/') && !r.endpoint.includes('/sos/'));
    const authEndpoints = results.filter(r => r.endpoint.includes('/user/') || r.endpoint.includes('/sos/'));

    console.log(`Public Endpoints: ${publicEndpoints.filter(r => r.success).length}/${publicEndpoints.length} passed`);
    console.log(`Authenticated Endpoints: ${authEndpoints.filter(r => r.success).length}/${authEndpoints.length} passed`);

    if (failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        console.log('='.repeat(60));
        results.filter(r => !r.success).forEach(r => {
            console.log(`  ${r.method} ${r.endpoint}`);
            console.log(`    Status: ${r.status}`);
            console.log(`    Error: ${r.error || 'Unknown'}\n`);
        });
    } else {
        console.log('\n🎉 ALL TESTS PASSED! Backend is fully functional!');
    }

    console.log('='.repeat(60));
}

runTests().catch(console.error);
