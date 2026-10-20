import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_CLIENT } from '../../redis/redis.module'

// 原来的黑名单用进程内存 Map 存，重启就丢、多实例部署时各自为政。
// 改用 Redis 后：数据集中、可共享，还能利用 TTL 让 key 到期自动清理，无需手动删除。
@Injectable()
export class TokenBlacklistService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  // 统一的 key 前缀，方便排查和批量清理
  private key(token: string) {
    return `auth:blacklist:${token}`
  }

  // 登出时把 token 写入黑名单，TTL 对齐 token 剩余有效期
  async add(token: string, expiresAt?: number) {
    // 没有过期时间时兜底保留 1 天
    const ttl = expiresAt ? Math.max(0, expiresAt - Date.now()) : 24 * 60 * 60 * 1000
    // SET key value PX ttl：value 存 '1' 仅作为标记，PX 表示毫秒过期
    await this.redis.set(this.key(token), '1', 'PX', ttl)
  }

  // 判断 token 是否已被登出
  async isBlacklisted(token: string) {
    return (await this.redis.exists(this.key(token))) === 1
  }
}
