/**
 * Browser-Based API Testing with Playwright
 * Properly handles NextAuth cookies and sessions
 */

import { chromium, Browser, Page } from 'playwright';

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

async function testWithBrowser() {
    console.log('🔍 Starting Browser-Based API Tests...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 1. Login first to get authenticated session
        console.log('🔐 Logging in...');
        await page.goto(`${baseUrl}/login`);
        await page.fill('input[type="email"]', 'test@vita.com');
        await page.fill('input[type="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 5000 });
        console.log('✅ Authentication successful\n');

        console.log('📋 Testing Endpoints:\n');

        // 2. Test Public Endpoints
        console.log('--- Public Endpoints ---');
        await testEndpoint(page, '/api/auth/csrf', 'GET');
        await testEndpoint(page, '/api/auth/session', 'GET');
        await testEndpoint(page, '/api/resources', 'GET');
        await testEndpoint(page, '/api/stats', 'GET');
        await testEndpoint(page, '/api/alerts', 'GET');

        // 3. Test Authenticated Endpoints
        console.log('\n--- Authenticated Endpoints ---');

        // User contacts
        await testEndpoint(page, '/api/user/contacts', 'GET');
        await testEndpoint(page, '/api/user/contacts', 'POST', {
            contacts: [
                { name: 'Test Contact 1', phone: '9876543210', relation: 'Friend' },
                { name: 'Test Contact 2', phone: '1234567890', relation: 'Family' }
            ]
        });

        // SOS
        await testEndpoint(page, '/api/sos/send', 'POST', {
            location: { lat: 28.6139, lng: 77.2090, address: 'Test Location' }
        });

        // Chat
        await testEndpoint(page, '/api/chat', 'POST', {
            message: 'Test emergency message'
        });

        // Volunteer
        await testEndpoint(page, '/api/volunteer/tasks', 'GET');

        // 4. Test Resource Creation
        console.log('\n--- Resource Management ---');
        await testEndpoint(page, '/api/resources', 'POST', {
            type: 'HOSPITAL',
            title: 'Test Hospital',
            description: 'Automated test hospital',
            lat: 28.6139,
            lng: 77.2090,
            address: 'Test Address, Delhi',
            city: 'Delhi',
            district: 'Central Delhi',
            contact: '1234567890',
            status: 'AVAILABLE'
        });

        // 5. Test Request Creation
        console.log('\n--- Request Management ---');
        await testEndpoint(page, '/api/requests', 'GET');
        await testEndpoint(page, '/api/requests', 'POST', {
            type: 'BLOOD',
            urgency: 'HIGH',
            description: 'Test blood request',
            contact: '9876543210',
            location: {
                lat: 28.6139,
                lng: 77.2090,
                address: 'Test Location'
            }
        });

        // 6. Test Location-Based Resources
        console.log('\n--- Location-Based Queries ---');
        await testEndpoint(page, '/api/resources?lat=28.6139&lng=77.2090&type=AMBULANCE', 'GET');
        await testEndpoint(page, '/api/resources?lat=28.6139&lng=77.2090&type=HOSPITAL', 'GET');

    } catch (error: any) {
        console.error('❌ Test execution failed:', error.message);
    } finally {
        await browser.close();
    }

    // Print summary
    printSummary();
}

async function testEndpoint(
    page: Page,
    endpoint: string,
    method: string = 'GET',
    body?: any
) {
    try {
        const response = await page.evaluate(async ({ endpoint, method, body }) => {
            const options: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Important for cookies
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const res = await fetch(endpoint, options);
            const data = await res.json().catch(() => ({}));

            return {
                status: res.status,
                ok: res.ok,
                data
            };
        }, { endpoint, method, body });

        logResult({
            endpoint,
            method,
            status: response.status,
            success: response.ok,
            error: !response.ok ? response.data.error || 'Request failed' : undefined
        });

    } catch (error: any) {
        logResult({
            endpoint,
            method,
            status: 0,
            success: false,
            error: error.message
        });
    }
}

function printSummary() {
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

    console.log('\n✅ All authenticated endpoints tested with real browser session!');
}

testWithBrowser().catch(console.error);
