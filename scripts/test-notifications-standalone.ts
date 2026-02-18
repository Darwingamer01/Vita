const nodemailer = require('nodemailer');
const twilio = require('twilio');
const webpush = require('web-push');
const dotenv = require('dotenv');
dotenv.config();

// --- Notification Logic (Mocked Copy from src/lib/notifications.ts) ---

// Email Configuration
const emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

// Twilio Configuration
// Basic check to avoid error if twilio module is loaded but keys missing
let twilioClient: any = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch (e) {
        console.warn('Failed to init Twilio:', e);
    }
}

// Web Push Configuration
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
        webpush.setVapidDetails(
            'mailto:support@vita.com',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    } catch (e) {
        console.warn('Failed to init WebPush:', e);
    }
}

async function sendSMS(to: any, body: any) {
    if (!twilioClient) {
        console.warn('[Notifications] Twilio not configured. Skipping SMS to:', to);
        return false;
    }

    try {
        const message = await twilioClient.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        console.log('[Notifications] SMS sent:', message.sid);
        return true;
    } catch (error) {
        console.error('[Notifications] SMS failed:', error);
        return false;
    }
}

async function sendEmail(to: any, subject: any, html: any) {
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
        console.warn('[Notifications] Email not configured. Skipping email to:', to);
        return false;
    }

    try {
        const info = await emailTransporter.sendMail({
            from: process.env.EMAIL_FROM || '"Vita Emergency" <noreply@vita.com>',
            to,
            subject,
            html,
        });
        console.log('[Notifications] Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('[Notifications] Email failed:', error);
        return false;
    }
}

async function sendSOSAlert(data: any) {
    const mapLink = `https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`;
    const message = `SOS! ${data.userName} needs help! Location: ${data.location.address || 'Unknown'}. Map: ${mapLink}`;

    // 1. Send SMS
    const smsSent = await sendSMS(data.contactPhone, message);

    // 2. Send Email (if email provided)
    let emailSent = false;
    if (data.contactEmail) {
        emailSent = await sendEmail(
            data.contactEmail,
            `SOS Alert from ${data.userName}`,
            `
            <h1>EMERGENCY ALERT</h1>
            <p><strong>${data.userName}</strong> has triggered an SOS alert.</p>
            <p><strong>Location:</strong> ${data.location.address || 'Unknown'}</p>
            <p><a href="${mapLink}" style="background: red; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View on Map</a></p>
            <p>Please contact them immediately or call emergency services.</p>
            `
        );
    }

    return { smsSent, emailSent };
}

// --- Test Execution ---

async function testNotifications() {
    console.log('--- Testing Notification Service (Standalone CJS) ---');

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
