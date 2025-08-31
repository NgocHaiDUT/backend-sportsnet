import { Controller, Get, Query ,Body,Post} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getUserMessages(@Query('userId') userId: string) {
    return this.chatService.getUserMessages(Number(userId));
  }

  @Get('following')
  async getFollowing(@Query('userId') userId: string) {
    return this.chatService.getFollowing(Number(userId));
  }
  
  @Get('user-info')
  async getUserInfo(@Query('userId') userId: string) {
    return this.chatService.getUserInfo(Number(userId));
  }

  @Get('conversation')
  async getConversation(
    @Query('userId') userId: string,
    @Query('otherId') otherId: string,
  ) {
    return this.chatService.getConversation(Number(userId), Number(otherId));
  }
  
  @Post('updateStatus')
  async updateStatus(@Body() userDto: {userId : String , otherId : String}) {
    if(userDto.userId && userDto.otherId)
    {
      return this.chatService.updateStatus(Number(userDto.userId),Number(userDto.otherId));
    }
    else return false;
  }

  // ✅ Share post via chat
  @Post('share-post')
  async sharePost(@Body() shareDto: {
    senderId: number;
    receiverId: number;
    postId: number;
    message?: string;
  }) {
    return this.chatService.sharePost(
      shareDto.senderId,
      shareDto.receiverId,
      shareDto.postId,
      shareDto.message || 'đã chia sẻ một bài viết'
    );
  }
}
