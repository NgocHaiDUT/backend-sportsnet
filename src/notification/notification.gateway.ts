// File: src/notification/notification.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const userSocketMap = new Map<string, string>();

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      console.log(`✅ User connected: ${userId}`);
      userSocketMap.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      console.log(`❌ User disconnected: ${userId}`);
      userSocketMap.delete(userId);
    }
  }

  sendNotificationToUser(userId: number, notificationData: any) {
    const userSocketId = userSocketMap.get(userId.toString());
    if (userSocketId) {
      this.server.to(userSocketId).emit('new_notification', notificationData);
      console.log(`🚀 Sent real-time notification to user ${userId}`);
    } else {
      console.log(`😴 User ${userId} is offline. Notification saved to DB.`);
    }
  }
}