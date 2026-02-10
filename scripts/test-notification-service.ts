import { sendSOSAlert, sendEmail, sendSMS } from '../src/lib/notifications';
import dotenv from 'dotenv';
dotenv.config();

async function testNotifications() {
    console.log('--- Testing Notification Service ---');

    // 1. Test Email (Mocking missing keys)
    console.log('\n1. Testing Email Sending...');
    const emailResult = await sendEmail('test@example.com', 'Test Subject', '<p>Test Body</p>');
    console.log('Email Result:', emailResult);

    // 2. Test SMS (Mocking missing keys)
    console.log('\n2. Testing SMS Sending...');
    const smsResult = await sendSMS('+1234567890', 'Test SMS Body');
    console.log('SMS Result:', smsResult);

    // 3. Test SOS Alert Logic
    console.log('\n3. Testing SOS Alert Logic...');
    const sosData = {
        userName: 'Test User',
        location: {
            lat: 28.6139,
            lng: 77.2090,
            address: 'New Delhi, India'
        },
        contactPhone: '+1234567890', // SMS
        contactEmail: 'contact@example.com' // Email
    };

    const sosResult = await sendSOSAlert(sosData);
    console.log('SOS Alert Result:', sosResult);

    console.log('\n--- Test Complete ---');
}

testNotifications().catch(console.error);
