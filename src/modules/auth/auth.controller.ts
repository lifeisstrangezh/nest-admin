import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  Req,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto } from './dto/create-auth.dto'
import { UpdateAuthDto } from './dto/update-auth.dto'
import { Public } from './public.decorator'
import { HttpExceptionFilter } from 'src/exception/http-exception.filter'
import { wrapperResponse } from '../../utils/index'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UseFilters(new HttpExceptionFilter())
  create(@Body() createAuthDto: CreateAuthDto) {
    console.log(createAuthDto)
    return wrapperResponse(this.authService.login(createAuthDto), '登陆成功')
  }

  @Post('logout')
  logout(@Req() req) {
    const token = req.headers.authorization?.split(' ')[1] ?? ''
    return wrapperResponse(this.authService.logout(token), '登出成功')
  }
}
