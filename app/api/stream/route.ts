import { memoryStore } from '../../../lib/memoryStore';

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection heartbeat
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

      // Subscribe to events
      const unsubscribe = memoryStore.subscribe((data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      });

      // Keep alive heartbeat every 15s to prevent connection drop
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(':\n\n'));
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
