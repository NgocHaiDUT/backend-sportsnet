import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  ParseIntPipe, 
  Post, 
  Put 
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto, LikeCommentDto } from './dto/comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('create')
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    console.log('=== CREATE COMMENT CONTROLLER DEBUG ===');
    console.log('Raw body received:', JSON.stringify(createCommentDto, null, 2));
    return this.commentService.createComment(createCommentDto);
  }

  @Post('reply')
  async replyToComment(@Body() createCommentDto: CreateCommentDto) {
    console.log('=== REPLY COMMENT CONTROLLER DEBUG ===');
    console.log('Raw body received:', JSON.stringify(createCommentDto, null, 2));
    return this.commentService.replyToComment(createCommentDto);
  }

  @Get('post/:postId')
  async getCommentsByPostId(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentService.getCommentsByPostId(postId);
  }

  @Get(':id')
  async getCommentById(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.getCommentById(id);
  }

  @Get(':commentId/replies')
  async getRepliesByCommentId(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentService.getRepliesByCommentId(commentId);
  }

  @Put(':id')
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  @Delete(':id')
  async deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.deleteComment(id);
  }

  @Post(':commentId/like/:userId')
  async likeComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.commentService.likeComment(commentId, userId);
  }

  @Delete(':commentId/like/:userId')
  async unlikeComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.commentService.unlikeComment(commentId, userId);
  }

  @Get(':commentId/likes')
  async getCommentLikes(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentService.getCommentLikes(commentId);
  }

  @Get(':commentId/like-status/:userId')
  async checkUserLikedComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.commentService.checkUserLikedComment(commentId, userId);
  }
}
