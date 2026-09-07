import { Injectable, UnauthorizedException } from '@nestjs/common'
import { CreateAuthDto } from './dto/create-auth.dto'
import { UpdateAuthDto } from './dto/update-auth.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Auth } from './entities/auth.entity'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import * as md5 from 'md5'
import { addToBlacklist } from './token-blacklist'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async login(createAuthDto: CreateAuthDto) {
    const user = await this.userService.findByUsername(createAuthDto.username)
    console.log('user', user)
    const md5Password = md5(createAuthDto.password).toUpperCase()
    console.log('md5Password', md5Password, user.password)
    if (user.password !== md5Password) {
      throw new UnauthorizedException()
    }
    // if (user.password !== createAuthDto.password) {
    //   throw new UnauthorizedException()
    // }
    const payload = { username: user.username, userid: user.id }
    return {
      token: await this.jwtService.signAsync(payload),
    }
  }

  async logout(token: string) {
    // 解析 token 拿到过期时间，黑名单记录到与 token 相同的过期时间
    const payload = this.jwtService.decode(token)
    addToBlacklist(token, payload?.exp ? payload.exp * 1000 : undefined)
  }
}
