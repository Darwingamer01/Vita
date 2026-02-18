import nodemailer from 'nodemailer';
import twilio from 'twilio';
import webpush from 'web-push';

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
// Twilio Configuration
let twilioClient: any = null;
try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } else {
        console.warn('[Notifications] Twilio credentials missing or invalid (must start with AC). SMS disabled.');
    }
} catch (e) {
    console.warn('[Notifications] Failed to initialize Twilio client:', e);
}

// Web Push Configuration
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:support@vita.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

interface SOSNotificationData {
    userName: string;
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
    contactPhone: string; // The emergency contact's phone
    contactEmail?: string; // The emergency contact's email (optional)
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS(to: string, body: string) {
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

/**
 * Send Email via Nodemailer
 */
export async function sendEmail(to: string, subject: string, html: string) {
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

/**
 * Send Push Notification
 */
export async function sendPushNotification(subscription: any, payload: string) {
    if (!process.env.VAPID_PRIVATE_KEY) {
        console.warn('[Notifications] VAPID keys not configured. Skipping push.');
        return false;
    }

    try {
        await webpush.sendNotification(subscription, payload);
        console.log('[Notifications] Push sent successfully');
        return true;
    } catch (error) {
        console.error('[Notifications] Push failed:', error);
        return false;
    }
}

/**
 * Helper: Send SOS Alerts
 */
export async function sendSOSAlert(data: SOSNotificationData) {
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
