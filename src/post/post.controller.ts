import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto, UploadImagesDto, LikePostDto } from './dto/post.dto';
import { multerConfig } from './config/multer.config';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  async createPost(@Body() createPostDto: CreatePostDto) {
    console.log('=== CREATE POST CONTROLLER DEBUG ===');
    console.log('Received data:', createPostDto);
    return this.postService.createPost(createPostDto);
  }

  @Post('upload-images/:postId')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async uploadPostImages(
    @Param('postId', ParseIntPipe) postId: number,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    console.log('=== UPLOAD IMAGES DEBUG ===');
    console.log('Post ID:', postId);
    console.log('Files count:', files.length);

    return this.postService.uploadPostImages(postId, files);
  }

  @Post('upload-images-base64/:postId')
  async uploadPostImagesBase64(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() uploadData: { images: Array<{ fileName: string; base64Data: string; mimeType: string }> }
  ) {
    if (!uploadData.images || uploadData.images.length === 0) {
      throw new BadRequestException('No images provided');
    }

    console.log('=== UPLOAD BASE64 IMAGES DEBUG ===');
    console.log('Post ID:', postId);
    console.log('Images count:', uploadData.images.length);

    return this.postService.uploadPostImagesBase64(postId, uploadData.images);
  }

  @Post('add-images')
  async addImagesToPost(@Body() uploadImagesDto: UploadImagesDto) {
    return this.postService.addImagesToPost(
      uploadImagesDto.postId,
      uploadImagesDto.imageUrls
    );
  }

  // ✅ New endpoint for uploading sample images
  @Post('upload-sample-images/:postId')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async uploadSampleImages(
    @Param('postId', ParseIntPipe) postId: number,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No sample images uploaded');
    }

    console.log('=== UPLOAD SAMPLE IMAGES DEBUG ===');
    console.log('Post ID:', postId);
    console.log('Sample images count:', files.length);
    files.forEach((file, index) => {
      console.log(`Sample image ${index + 1}:`, {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
    });

    return this.postService.uploadSampleImages(postId, files);
  }

  // ✅ New endpoint for uploading sample images via base64
  @Post('upload-sample-images-base64/:postId')
  async uploadSampleImagesBase64(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() uploadData: { images: Array<{ fileName: string; base64Data: string; mimeType: string }> }
  ) {
    if (!uploadData.images || uploadData.images.length === 0) {
      throw new BadRequestException('No sample images provided');
    }

    console.log('=== UPLOAD SAMPLE IMAGES BASE64 DEBUG ===');
    console.log('Post ID:', postId);
    console.log('Sample images count:', uploadData.images.length);
    uploadData.images.forEach((img, index) => {
      console.log(`Sample image ${index + 1}:`, {
        fileName: img.fileName,
        mimeType: img.mimeType,
        sizeKB: Math.round(img.base64Data.length * 0.75 / 1024)
      });
    });

    return this.postService.uploadSampleImagesBase64(postId, uploadData.images);
  }

  @Delete('image/:imageId')
  async removeImageFromPost(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.postService.removeImageFromPost(imageId);
  }

  @Get('all')
  async getAllPosts() {
    return this.postService.getAllPosts();
  }

  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getPostById(id);
  }

  @Get('user/:userId')
  async getPostsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.postService.getPostsByUserId(userId);
  }

  @Put(':id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto
  ) {
    return this.postService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postService.deletePost(id);
  }

  @Post(':postId/like/:userId')
  async likePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.postService.likePost(postId, userId);
  }

  @Delete(':postId/like/:userId')
  async unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.postService.unlikePost(postId, userId);
  }

  @Get(':postId/likes')
  async getPostLikes(@Param('postId', ParseIntPipe) postId: number) {
    return this.postService.getPostLikes(postId);
  }

  @Get(':postId/like-status/:userId')
  async checkUserLikedPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.postService.checkUserLikedPost(postId, userId);
  }

  // Legacy endpoint for single image upload (backward compatibility)
  @Post('upload-image/:postId')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async uploadSingleImage(
    @Param('postId', ParseIntPipe) postId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.postService.uploadPostImages(postId, [file]);
  }

  @Post('share')
  async sharePost(@Body() shareData: { postId: string; userIds: number[]; message?: string }) {
    console.log('=== SHARE POST CONTROLLER DEBUG ===');
    console.log('Share data:', shareData);
    return this.postService.sharePost(shareData.postId, shareData.userIds, shareData.message);
  }
}
