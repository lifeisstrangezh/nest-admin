import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseFilters,
} from '@nestjs/common'
import { AppService } from './app.service'
import { HttpExceptionFilter } from './exception/http-exception.filter'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('/data/:id/:subId')
  @UseFilters(new HttpExceptionFilter())
  getData(@Param() params: { id: string; subId: string }): string {
    console.log('params', params)
    return this.appService.getData(params)
  }

  @Get('/get_all_data')
  getAllData(): string {
    return 'get all data'
  }

  @Post('/data')
  addData(@Body() body, @Query() query): string {
    console.log('post body', body)
    console.log('query', query)
    return 'add data1'
  }

  @Put('/data/:id')
  updateData(): string {
    return 'update data'
  }

  @Delete('/data/:id')
  deleteData(): string {
    return 'delete data'
  }
}
