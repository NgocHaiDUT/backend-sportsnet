import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { senderId: number; receiverId: number; content: string }
  ) {
    // Lưu DB
    const msg = await this.chatService.sendMessage(
      data.senderId,
      data.receiverId,
      data.content,
    );

    // Gửi lại cho cả sender + receiver
    this.server.to(`${data.senderId}`).emit('newMessage', msg);
    this.server.to(`${data.receiverId}`).emit('newMessage', msg);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
    client.join(`${userId}`); // mỗi user join vào "room" theo userId
    console.log(`User ${userId} joined`);
  }

  @SubscribeMessage('openChat')
  async handleOpenChat(
    @MessageBody() data: { openerId: number; targetId: number },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data || !data.openerId || !data.targetId) return;

    // get basic info for the target
    const user = await this.chatService.getUserInfo(Number(data.targetId));

    // notify the target user (optional UX signal)
    this.server.to(`${data.targetId}`).emit('openChat', { from: data.openerId, user });

    // reply to the opener with existing conversation so frontend can open the window
    const conv = await this.chatService.getConversation(Number(data.openerId), Number(data.targetId));
    client.emit('conversation', { with: user, messages: conv });
  }
}