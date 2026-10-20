import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { CreateAuthDto } from './dto/create-auth.dto'
import { UpdateAuthDto } from './dto/update-auth.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Auth } from './entities/auth.entity'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import * as md5 from 'md5'
import { TokenBlacklistService } from './token-blacklist.service'
import { REDIS_CLIENT } from '../../redis/redis.module'
import Redis from 'ioredis'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async login(createAuthDto: CreateAuthDto) {
    // 限流：同一用户名 60 秒内最多尝试 5 次，防止暴力破解
    await this.checkLoginRate(createAuthDto.username)

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
    await this.tokenBlacklistService.add(
      token,
      payload?.exp ? payload.exp * 1000 : undefined,
    )
  }

  // 基于 Redis 计数器的简单限流：INCR 自增 + EXPIRE 设置过期时间
  private async checkLoginRate(username: string) {
    const key = `auth:login:rate:${username}`
    const attempts = await this.redis.incr(key)
    // 第一次计数时设置过期时间，形成 60 秒的滑动窗口
    if (attempts === 1) {
      await this.redis.expire(key, 60)
    }
    if (attempts > 5) {
      throw new HttpException(
        '尝试次数过多，请 1 分钟后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }
  }
}
