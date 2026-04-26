import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || 'mock-app-id',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'mock-key',
  secret: process.env.PUSHER_SECRET || 'mock-secret',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  useTLS: true,
});

export const getPusherClient = () => {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY || 'mock-key', {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  });
};
