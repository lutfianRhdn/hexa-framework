import fs from 'fs-extra';
import path from 'path';
import { GeneratorContext } from '../../types';

export async function generateWebSocketTransport(ctx: GeneratorContext): Promise<void> {
  const { srcPath, config } = ctx;
  const transportPath = path.join(srcPath, 'transports', 'websocket');
  
  await fs.ensureDir(path.join(transportPath, 'handlers'));
  await fs.ensureDir(path.join(transportPath, 'events'));

  // Generate base WebSocket setup
  await generateWebSocketConfig(transportPath, config.template);

  // Generate event handlers
  await generateConnectionHandler(transportPath);
  
  if (config.template === 'basic-auth' || config.template === 'full-auth') {
    await generateAuthHandler(transportPath);
  }

  // Generate example event handlers
  await generateExampleEvents(transportPath);

  console.log('  ✅ WebSocket transport files generated');
}

async function generateWebSocketConfig(transportPath: string, template: string) {
  const hasAuth = template === 'basic-auth' || template === 'full-auth';

  const config = `import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';${hasAuth ? `
import jwt from 'jsonwebtoken';
import { config } from '../../configs/env';
import prisma from '../../configs/database';` : ''}

export interface SocketData {
  userId?: string | number;
  email?: string;
}

export type AuthenticatedSocket = Socket<any, any, any, SocketData>;

export function setupWebSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
${hasAuth ? `
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string | number; email: string };
      
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        return next(new Error('Invalid user'));
      }

      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;
      
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });
` : ''}
  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(\`Client connected: \${socket.id}\`${hasAuth ? ` (User: \${socket.data.email})` : ''});

    // Import and setup event handlers
    require('./handlers/connectionHandler').setupConnectionHandlers(socket, io);
    require('./handlers/exampleHandler').setupExampleHandlers(socket, io);

    socket.on('disconnect', (reason) => {
      console.log(\`Client disconnected: \${socket.id}, Reason: \${reason}\`);
    });
  });

  return io;
}
`;

  await fs.writeFile(path.join(transportPath, 'index.ts'), config);
}

async function generateConnectionHandler(transportPath: string) {
  const handler = `import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../index';

export function setupConnectionHandlers(socket: AuthenticatedSocket, io: SocketIOServer) {
  // Ping-pong for connection health check
  socket.on('ping', () => {
    socket.emit('pong', {
      timestamp: new Date().toISOString(),
      message: 'Connection is alive'
    });
  });

  // Join room
  socket.on('join-room', (roomName: string) => {
    socket.join(roomName);
    socket.emit('room-joined', {
      room: roomName,
      message: \`Successfully joined room: \${roomName}\`
    });
    
    // Notify others in the room
    socket.to(roomName).emit('user-joined', {
      socketId: socket.id,
      userId: socket.data.userId,
      room: roomName
    });
  });

  // Leave room
  socket.on('leave-room', (roomName: string) => {
    socket.leave(roomName);
    socket.emit('room-left', {
      room: roomName,
      message: \`Left room: \${roomName}\`
    });
    
    // Notify others in the room
    socket.to(roomName).emit('user-left', {
      socketId: socket.id,
      userId: socket.data.userId,
      room: roomName
    });
  });

  // Broadcast to room
  socket.on('broadcast-to-room', (data: { room: string; message: any }) => {
    socket.to(data.room).emit('room-broadcast', {
      from: socket.id,
      userId: socket.data.userId,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });
}
`;

  await fs.writeFile(path.join(transportPath, 'handlers', 'connectionHandler.ts'), handler);
}

async function generateAuthHandler(transportPath: string) {
  const handler = `import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../index';
import prisma from '../../../configs/database';

export function setupAuthHandlers(socket: AuthenticatedSocket, io: SocketIOServer) {
  // Get current user info
  socket.on('me', async (callback) => {
    try {
      if (!socket.data.userId) {
        return callback({
          success: false,
          message: 'Not authenticated'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: socket.data.userId },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      callback({
        success: true,
        data: user
      });
    } catch (error: any) {
      callback({
        success: false,
        message: error.message || 'Failed to fetch user data'
      });
    }
  });

  // User status updates
  socket.on('update-status', async (status: string) => {
    if (!socket.data.userId) {
      return;
    }

    // Broadcast status update to all connected clients
    io.emit('user-status-changed', {
      userId: socket.data.userId,
      status,
      timestamp: new Date().toISOString()
    });
  });
}
`;

  await fs.writeFile(path.join(transportPath, 'handlers', 'authHandler.ts'), handler);
}

async function generateExampleEvents(transportPath: string) {
  const events = `import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../index';

export function setupExampleHandlers(socket: AuthenticatedSocket, io: SocketIOServer) {
  // Echo message - sends back the same message
  socket.on('echo', (data: any, callback?) => {
    const response = {
      success: true,
      message: 'Echo response',
      data: data,
      timestamp: new Date().toISOString()
    };

    if (callback && typeof callback === 'function') {
      callback(response);
    } else {
      socket.emit('echo-response', response);
    }
  });

  // Broadcast message to all clients
  socket.on('broadcast', (data: { message: string }) => {
    io.emit('broadcast-received', {
      from: socket.id,
      userId: socket.data.userId,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  // Send message to specific user
  socket.on('private-message', (data: { targetSocketId: string; message: string }) => {
    io.to(data.targetSocketId).emit('private-message-received', {
      from: socket.id,
      userId: socket.data.userId,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  // Typing indicator
  socket.on('typing-start', (data: { room?: string }) => {
    const event = {
      userId: socket.data.userId,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    };

    if (data.room) {
      socket.to(data.room).emit('user-typing', event);
    } else {
      socket.broadcast.emit('user-typing', event);
    }
  });

  socket.on('typing-stop', (data: { room?: string }) => {
    const event = {
      userId: socket.data.userId,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    };

    if (data.room) {
      socket.to(data.room).emit('user-stopped-typing', event);
    } else {
      socket.broadcast.emit('user-stopped-typing', event);
    }
  });

  // Get connected clients count
  socket.on('get-clients-count', async (callback) => {
    const sockets = await io.fetchSockets();
    callback({
      success: true,
      count: sockets.length,
      timestamp: new Date().toISOString()
    });
  });

  // Get rooms list
  socket.on('get-rooms', (callback) => {
    const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
    callback({
      success: true,
      rooms,
      timestamp: new Date().toISOString()
    });
  });
}
`;

  await fs.writeFile(path.join(transportPath, 'handlers', 'exampleHandler.ts'), events);

  // Also generate events documentation
  const eventsDoc = `# WebSocket Events

## Connection Events

### ping
- **Description**: Health check ping
- **Response**: \`pong\` event with timestamp

### join-room
- **Payload**: \`string\` - Room name
- **Response**: \`room-joined\` event
- **Broadcast**: \`user-joined\` to room members

### leave-room
- **Payload**: \`string\` - Room name
- **Response**: \`room-left\` event
- **Broadcast**: \`user-left\` to room members

### broadcast-to-room
- **Payload**: \`{ room: string, message: any }\`
- **Broadcast**: \`room-broadcast\` to room members

## Example Events

### echo
- **Payload**: \`any\`
- **Response**: Same data with timestamp

### broadcast
- **Payload**: \`{ message: string }\`
- **Broadcast**: \`broadcast-received\` to all clients

### private-message
- **Payload**: \`{ targetSocketId: string, message: string }\`
- **Target**: \`private-message-received\` to specific socket

### typing-start / typing-stop
- **Payload**: \`{ room?: string }\` (optional)
- **Broadcast**: \`user-typing\` or \`user-stopped-typing\`

### get-clients-count
- **Callback**: Returns connected clients count

### get-rooms
- **Callback**: Returns list of rooms current socket is in

## Authentication Events (if auth enabled)

### me
- **Callback**: Returns current user information
- **Requires**: Authentication token

### update-status
- **Payload**: \`string\` - Status message
- **Broadcast**: \`user-status-changed\` to all clients
`;

  await fs.writeFile(path.join(transportPath, 'events', 'EVENTS.md'), eventsDoc);
}
