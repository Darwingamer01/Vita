/**
 * Quick diagnostic to check if contacts API is working
 */

async function testContactsAPI() {
    const baseUrl = 'http://localhost:3000';

    console.log('🔍 Testing Contacts API with Browser Simulation...\n');

    try {
        // 1. Get CSRF Token
        console.log('Step 1: Getting CSRF token...');
        const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
        const csrfData = await csrfRes.json();
        console.log('✅ CSRF Token:', csrfData.csrfToken.substring(0, 20) + '...');

        // 2. Login
        console.log('\nStep 2: Logging in...');
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

        console.log('Login Status:', loginRes.status);

        // Extract cookies properly
        const getCookie = (headers: Headers, name: string) => {
            const setCookie = headers.get('set-cookie') || '';
            const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
            return match ? `${name}=${match[1]}` : '';
        };

        const csrfCookie = getCookie(csrfRes.headers, 'next-auth.csrf-token');
        const sessionCookie = getCookie(loginRes.headers, 'next-auth.session-token');
        const cookies = [csrfCookie, sessionCookie].filter(Boolean).join('; ');

        console.log('✅ Session Cookie:', sessionCookie ? sessionCookie.substring(0, 50) + '...' : 'MISSING!');

        if (!sessionCookie) {
            console.error('❌ No session cookie received! Login may have failed.');
            return;
        }

        // 3. Test GET contacts
        console.log('\nStep 3: Testing GET /api/user/contacts...');
        const getRes = await fetch(`${baseUrl}/api/user/contacts`, {
            headers: {
                'Cookie': cookies
            }
        });

        console.log('GET Status:', getRes.status);
        const getData = await getRes.json();
        console.log('GET Response:', JSON.stringify(getData, null, 2));

        // 4. Test POST contacts
        console.log('\nStep 4: Testing POST /api/user/contacts...');
        const postRes = await fetch(`${baseUrl}/api/user/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies
            },
            body: JSON.stringify({
                contacts: ['9876543210', '1234567890']
            })
        });

        console.log('POST Status:', postRes.status);
        const postData = await postRes.json();
        console.log('POST Response:', JSON.stringify(postData, null, 2));

        if (postRes.ok) {
            console.log('\n✅ SUCCESS! Contacts saved successfully!');
        } else {
            console.log('\n❌ FAILED! Error:', postData.error);
            if (postData.debug_session !== undefined) {
                console.log('Debug Session:', postData.debug_session);
            }
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

testContactsAPI();
