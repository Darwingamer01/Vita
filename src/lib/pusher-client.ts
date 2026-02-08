
import PusherClient from 'pusher-js';

// Client-side Pusher instance (for subscribing to events)
export const pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY || 'APP_KEY',
    {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
    }
);
