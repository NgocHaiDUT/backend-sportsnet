import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCommentDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  postId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  parentId?: number; // Cho reply comment
}

export class UpdateCommentDto {
  @IsString()
  @IsOptional()
  content?: string;
}

export class LikeCommentDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  commentId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  userId: number;
}

export interface CommentResponseDto {
  id: number;
  postId: number;
  userId: number;  // Changed from accountId to userId to match frontend
  content: string;
  createAt: Date;
  parentId?: number;
  likeCount: number;
  isLiked?: boolean; // Để check user đã like chưa
  account: {
    id: number;
    fullname: string;
    username: string;
    avatar?: string;
  };
  replies?: CommentResponseDto[]; // Cho nested comments
  likes?: {
    id: number;
    userId: number;
    account: {
      id: number;
      fullname: string;
      username: string;
      avatar?: string;
    };
  }[];
}
