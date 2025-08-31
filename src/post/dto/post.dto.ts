import { IsString, IsInt, IsOptional, IsNotEmpty, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreatePostDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  userId: number;

  @IsString()
  @IsNotEmpty()
  type: string; // 'text', 'image', 'video'

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  mode: string; // 'public', 'private', 'friends'

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  sports?: string; // 'Bóng đá', 'Tennis', 'Bóng rổ', etc.

  @IsString()
  @IsOptional()
  topic?: string; // 'Tìm bạn', 'Giải đấu', 'Tuyển thành viên'

  @IsString()
  @IsOptional()
  video?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  imageUrls?: string[];
}


export class UpdatePostDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  mode?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  sports?: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsString()
  @IsOptional()
  video?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class UploadImagesDto {
  @IsInt()
  @Type(() => Number)
  postId: number;

  @IsArray()
  @IsString({ each: true })
  imageUrls: string[];
}

export class LikePostDto {
  @IsInt()
  @Type(() => Number)
  userId: number;

  @IsInt()
  @Type(() => Number)
  postId: number;
}
