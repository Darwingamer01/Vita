/**
 * Detailed login diagnostic - check what NextAuth is actually returning
 */

async function diagnoseLogin() {
    const baseUrl = 'http://localhost:3000';

    console.log('🔍 Detailed Login Diagnostic...\n');

    try {
        // 1. Get CSRF Token
        console.log('Step 1: Getting CSRF token...');
        const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
        const csrfData = await csrfRes.json();
        console.log('CSRF Token:', csrfData.csrfToken.substring(0, 20) + '...');

        // 2. Attempt Login
        console.log('\nStep 2: Attempting login...');
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

        console.log('\n=== LOGIN RESPONSE ===');
        console.log('Status:', loginRes.status);
        console.log('Status Text:', loginRes.statusText);
        console.log('\nHeaders:');
        loginRes.headers.forEach((value, key) => {
            console.log(`  ${key}: ${value}`);
        });

        const loginBody = await loginRes.text();
        console.log('\nResponse Body:');
        console.log(loginBody);

        try {
            const loginJson = JSON.parse(loginBody);
            console.log('\nParsed JSON:');
            console.log(JSON.stringify(loginJson, null, 2));
        } catch (e) {
            console.log('(Response is not JSON)');
        }

    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
    }
}

diagnoseLogin();
