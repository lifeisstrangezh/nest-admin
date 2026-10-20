import { Global, Module } from '@nestjs/common'
import Redis from 'ioredis'

// 全局注入的 Redis 客户端标识，其他模块用 @Inject(REDIS_CLIENT) 拿到同一个连接
export const REDIS_CLIENT = 'REDIS_CLIENT'

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const client = new Redis({
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,
          // 有密码才传，本地无密码时传 undefined 避免报错
          password: process.env.REDIS_PASSWORD || undefined,
        })
        // ioredis 连接失败会不断重试并 emit 'error'，没有监听器会让进程崩溃
        client.on('error', (err) => {
          console.error('[Redis] 连接异常:', err.message)
        })
        return client
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
