
import { parse } from 'cookie';

async function verifyAuth() {
    const baseUrl = 'http://localhost:3000';
    console.log(`Testing auth flow against ${baseUrl}...`);

    try {
        // 1. Get CSRF Token
        console.log('1. Fetching CSRF Token...');
        const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
        const csrfData = await csrfRes.json();
        const csrfToken = csrfData.csrfToken;
        const csrfCookies = csrfRes.headers.get('set-cookie');

        console.log('CSRF Token:', csrfToken);

        // 2. Login
        console.log('2. Logging in...');
        const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': csrfCookies || ''
            },
            body: new URLSearchParams({
                csrfToken: csrfToken,
                email: 'test@vita.com',
                password: 'password',
                json: 'true'
            })
        });

        const loginCookies = loginRes.headers.get('set-cookie');
        // Helper to extract cookie key=value using Regex
        const getCookie = (headers: Headers, name: string) => {
            const setCookie = headers.get('set-cookie') || '';
            const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
            return match ? `${name}=${match[1]}` : '';
        };

        const csrfTokenCookie = getCookie(csrfRes.headers, 'next-auth.csrf-token');
        const callbackCookie = getCookie(loginRes.headers, 'next-auth.callback-url');
        const sessionCookie = getCookie(loginRes.headers, 'next-auth.session-token');

        // Combine cookies
        const allCookies = [csrfTokenCookie, callbackCookie, sessionCookie].filter(Boolean).join('; ');
        console.log('Sending Cookie Header:', allCookies);

        // 3. Test Protected API
        console.log('3. Testing Contact Save...');
        const contactRes = await fetch(`${baseUrl}/api/user/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': allCookies
            },
            body: JSON.stringify({
                contacts: ['1234567890']
            })
        });

        console.log('Contact Save Status:', contactRes.status);
        const contactData = await contactRes.json();
        console.log('Contact Save Response:', JSON.stringify(contactData, null, 2));

        if (contactRes.ok) {
            console.log('SUCCESS: Auth flow confirmed working.');
        } else {
            console.log('FAILURE: Auth flow failed.');
        }

    } catch (error) {
        console.error('Test Failed with Error:', error);
    }
}

verifyAuth();
