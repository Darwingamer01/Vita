/**
 * Test login using NextAuth's signin method directly
 */

async function testSignIn() {
    const baseUrl = 'http://localhost:3000';

    console.log('🔍 Testing NextAuth SignIn...\n');

    try {
        // Test with proper NextAuth signin endpoint
        console.log('Attempting signin with proper format...');

        const res = await fetch(`${baseUrl}/api/auth/signin/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@vita.com',
                password: 'password',
                redirect: false
            })
        });

        console.log('Status:', res.status);
        console.log('\nHeaders:');
        res.headers.forEach((value, key) => {
            console.log(`  ${key}: ${value}`);
        });

        const body = await res.text();
        console.log('\nResponse Body:');
        console.log(body);

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testSignIn();
