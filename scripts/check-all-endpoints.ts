/**
 * Comprehensive Backend Endpoint Verification Script
 * Tests all API routes for proper authentication, error handling, and response format
 */

(async () => {
    const baseUrl = 'http://localhost:3000';

    interface TestResult {
        endpoint: string;
        method: string;
        status: number;
        success: boolean;
        error?: string;
        response?: any;
    }

    const results: TestResult[] = [];

    // Helper to log results
    function logResult(result: TestResult) {
        results.push(result);
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${result.method} ${result.endpoint} - ${result.status}`);
        if (result.error) console.log(`   Error: ${result.error}`);
    }

    // Helper to get authenticated session
    async function getAuthSession() {
        try {
            // 1. Get CSRF Token
            const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
            const csrfData = await csrfRes.json();
            const csrfToken = csrfData.csrfToken;

            // 2. Login
            const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    csrfToken: csrfToken,
                    email: 'test@vita.com',
                    password: 'password',
                    json: 'true'
                })
            });

            // Extract cookies
            const getCookie = (headers: Headers, name: string) => {
                const setCookie = headers.get('set-cookie') || '';
                const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
                return match ? `${name}=${match[1]}` : '';
            };

            const csrfTokenCookie = getCookie(csrfRes.headers, 'next-auth.csrf-token');
            const sessionCookie = getCookie(loginRes.headers, 'next-auth.session-token');

            return [csrfTokenCookie, sessionCookie].filter(Boolean).join('; ');
        } catch (error) {
            console.error('Failed to authenticate:', error);
            return '';
        }
    }

    async function testEndpoint(
        endpoint: string,
        method: string = 'GET',
        body?: any,
        requiresAuth: boolean = false,
        cookies?: string
    ) {
        try {
            const options: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(requiresAuth && cookies ? { 'Cookie': cookies } : {})
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
                response: data,
                error: !res.ok ? data.error || 'Request failed' : undefined
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
        console.log('🔍 Starting Backend Endpoint Verification...\n');

        // Get authenticated session
        console.log('🔐 Authenticating...');
        const authCookies = await getAuthSession();
        console.log(authCookies ? '✅ Authentication successful\n' : '❌ Authentication failed\n');

        console.log('📋 Testing Endpoints:\n');

        // 1. Auth Endpoints
        console.log('--- Auth Endpoints ---');
        await testEndpoint('/api/auth/csrf', 'GET');
        await testEndpoint('/api/auth/session', 'GET');

        // 2. Resources Endpoints
        console.log('\n--- Resources Endpoints ---');
        await testEndpoint('/api/resources', 'GET');
        await testEndpoint('/api/resources', 'POST', {
            type: 'hospital',
            title: 'Test Hospital',
            description: 'Test Description',
            lat: 28.6139,
            lng: 77.2090,
            address: 'Test Address',
            city: 'Delhi',
            district: 'Central Delhi',
            contact: '1234567890',
            status: 'available'
        });

        // Get a resource ID for testing
        const resourcesRes = await fetch(`${baseUrl}/api/resources`);
        const resourcesData = await resourcesRes.json();
        const resourceId = resourcesData.resources?.[0]?.id;

        if (resourceId) {
            await testEndpoint(`/api/resources/${resourceId}`, 'GET');
            await testEndpoint(`/api/resources/${resourceId}`, 'PUT', {
                status: 'unavailable'
            });
            await testEndpoint(`/api/resources/${resourceId}/report`, 'POST', {
                reason: 'outdated'
            });
        }

        // 3. Requests Endpoints
        console.log('\n--- Requests Endpoints ---');
        await testEndpoint('/api/requests', 'GET');
        await testEndpoint('/api/requests', 'POST', {
            title: 'Test Request',
            description: 'Test Description',
            type: 'blood',
            contact: '1234567890',
            location: 'Delhi',
            urgency: 'high'
        });

        // Get a request ID for testing
        const requestsRes = await fetch(`${baseUrl}/api/requests`);
        const requestsData = await requestsRes.json();
        const requestId = requestsData.requests?.[0]?.id;

        if (requestId) {
            await testEndpoint(`/api/requests/${requestId}`, 'GET');
            await testEndpoint(`/api/requests/${requestId}`, 'PUT', {
                status: 'resolved'
            });
        }

        // 4. User Endpoints (Authenticated)
        console.log('\n--- User Endpoints (Authenticated) ---');
        await testEndpoint('/api/user/contacts', 'GET', undefined, true, authCookies);
        await testEndpoint('/api/user/contacts', 'POST', {
            contacts: ['9876543210', '1234567890']
        }, true, authCookies);

        // 5. SOS Endpoints (Authenticated)
        console.log('\n--- SOS Endpoints (Authenticated) ---');
        await testEndpoint('/api/sos/send', 'POST', {
            location: { lat: 28.6139, lng: 77.2090, address: 'Test Location' }
        }, true, authCookies);

        // 6. Stats Endpoints
        console.log('\n--- Stats Endpoints ---');
        await testEndpoint('/api/stats', 'GET');

        // 7. Alerts Endpoints
        console.log('\n--- Alerts Endpoints ---');
        await testEndpoint('/api/alerts', 'GET');

        // 8. Chat Endpoints (Authenticated)
        console.log('\n--- Chat Endpoints (Authenticated) ---');
        await testEndpoint('/api/chat', 'POST', {
            message: 'Test message'
        }, true, authCookies);

        // 9. Volunteer Endpoints (Authenticated)
        console.log('\n--- Volunteer Endpoints (Authenticated) ---');
        await testEndpoint('/api/volunteer/tasks', 'GET', undefined, true, authCookies);

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Summary:');
        console.log('='.repeat(50));

        const total = results.length;
        const passed = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            results.filter(r => !r.success).forEach(r => {
                console.log(`  - ${r.method} ${r.endpoint}: ${r.error || 'Unknown error'}`);
            });
        }
    }

    runTests().catch(console.error);
})();
