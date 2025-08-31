import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('all')
  async searchAll(
    @Query('q') query: string,
    @Query('postLimit') postLimit?: string,
    @Query('userLimit') userLimit?: string,
  ) {
    const postLimitNum = postLimit ? parseInt(postLimit, 10) : 10;
    const userLimitNum = userLimit ? parseInt(userLimit, 10) : 10;
    
    return this.searchService.searchAll(query, postLimitNum, userLimitNum);
  }

  @Get('posts')
  async searchPosts(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.searchService.searchPosts(query, limitNum);
  }

  @Get('users')
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.searchService.searchUsers(query, limitNum);
  }

  @Get('users/posts')
  async getPublicPostsByUsers(
    @Query('userIds') userIds: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const userIdArray = userIds.split(',').map(id => parseInt(id, 10));
    return this.searchService.getPublicPostsByUsers(userIdArray, limitNum);
  }
}
