 
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

async getUserMessages(userId: number) {
    return this.prisma.messages.findMany({
      where: {
        OR: [
          { Sender_id: userId },
          { Receiver_id: userId },
        ],
      },
      orderBy: { CreateAt: 'asc' },
      include: {
        sender: { select: { Id: true, User_name: true, Avatar: true } },
        receiver: { select: { Id: true, User_name: true, Avatar: true } },
      },
    });
  }


async sendMessage(senderId: number, receiverId: number, content: string) {
    // validate ids
    if (!Number.isInteger(senderId) || !Number.isInteger(receiverId)) {
      throw new BadRequestException('Invalid sender or receiver id');
    }

    // ensure both accounts exist to avoid FK errors
    const [sender, receiver] = await Promise.all([
      this.prisma.account.findUnique({ where: { Id: senderId } }),
      this.prisma.account.findUnique({ where: { Id: receiverId } }),
    ]);

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or receiver not found');
    }

    return this.prisma.messages.create({
      data: {
        Sender_id: senderId,
        Receiver_id: receiverId,
        Content: content,
        Status: false,
        CreateAt: new Date(),
      },
    });
  }


   async getFollowing(userId: number) {
    if (!Number.isInteger(userId) || userId <= 0) return [];

    const rows = await this.prisma.follow.findMany({
      where: { Follower_id: userId },
      select: {
        following: { select: { Id: true, User_name: true, Avatar: true } },
      },
    });

    return rows.map((r) => r.following);
  }

  async getUserInfo(userId: number) {
    if (!Number.isInteger(userId) || userId <= 0) return null;
    return this.prisma.account.findUnique({
      where: { Id: userId },
      select: { Id: true, User_name: true, Avatar: true },
    });
  }

  async getConversation(userId: number, otherId: number) {
    if (!Number.isInteger(userId) || !Number.isInteger(otherId)) return [];
    return this.prisma.messages.findMany({
      where: {
        OR: [
          { Sender_id: userId, Receiver_id: otherId },
          { Sender_id: otherId, Receiver_id: userId },
        ],
      },
      orderBy: { CreateAt: 'asc' },
      include: {
        sender: { select: { Id: true, User_name: true, Avatar: true } },
        receiver: { select: { Id: true, User_name: true, Avatar: true } },
      },
    });
  } 
  async updateStatus(userId:number, otherId:number)
  {
      if (!Number.isInteger(userId) || !Number.isInteger(otherId)) return false;

      const updateStatus = await this.prisma.messages.updateMany({
        where: { Sender_id:otherId , Receiver_id : userId},
        data : {
          Status : true
        }
      })
      return updateStatus.count > 0 ;
  }
}
