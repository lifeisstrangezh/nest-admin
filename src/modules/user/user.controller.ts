import { Controller, Get, UseFilters, Param, ParseIntPipe } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get('/:id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    console.log('id', id);
    return 'get user ' + id;
  }
}
