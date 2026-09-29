import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

interface ClientMeta {
  ws: WebSocket;
  userId?: number;
  userName?: string;
  avatar?: string;
  activeTaskId?: number | null;
}

const clients = new Map<WebSocket, ClientMeta>();

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    const meta: ClientMeta = { ws };
    clients.set(ws, meta);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'IDENTIFY') {
          meta.userId = message.userId;
          meta.userName = message.userName;
          meta.avatar = message.avatar;
          broadcastPresence();
        } else if (message.type === 'VIEWING_TASK') {
          meta.activeTaskId = message.taskId;
          broadcastViewing(meta.userName || 'Someone', message.taskId);
        } else if (message.type === 'LEAVING_TASK') {
          meta.activeTaskId = null;
          broadcastViewing('', null);
        }
      } catch (err) {
        console.error('Failed to parse WS message:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      broadcastPresence();
    });

    // Send initial greeting
    ws.send(JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() }));
    broadcastPresence();
  });

  return {
    broadcast: (event: string, payload: any) => {
      const data = JSON.stringify({ type: event, ...payload });
      for (const [ws] of clients) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      }
    },
  };
}

function broadcastPresence() {
  const onlineUsers = Array.from(clients.values())
    .filter((c) => c.userName)
    .map((c) => ({
      userId: c.userId,
      name: c.userName,
      avatar: c.avatar,
      activeTaskId: c.activeTaskId,
    }));

  const payload = JSON.stringify({
    type: 'PRESENCE_UPDATE',
    users: onlineUsers,
  });

  for (const [ws] of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

function broadcastViewing(userName: string, taskId: number | null) {
  const payload = JSON.stringify({
    type: 'TASK_VIEWER',
    userName,
    taskId,
  });

  for (const [ws] of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}
