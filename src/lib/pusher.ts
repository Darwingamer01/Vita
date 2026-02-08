import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance (for triggering events)
// Only initialize if environment variables are present to avoid build errors
export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID || 'APP_ID',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'APP_KEY',
    secret: process.env.PUSHER_SECRET || 'APP_SECRET',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
    useTLS: true,
});

// Client-side Pusher instance (for subscribing to events)
export const pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY || 'APP_KEY',
    {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
    }
);
