// JWT 是无状态的，服务端无法主动让已签发的 token 失效
// 通过内存黑名单记录登出后的 token，配合 AuthGuard 校验实现登出
const blacklist = new Map<string, number>()

export function addToBlacklist(token: string, expiresAt?: number) {
  // 没有过期时间时默认保留 1 天，避免黑名单无限增长
  blacklist.set(token, expiresAt ?? Date.now() + 24 * 60 * 60 * 1000)
}

export function isBlacklisted(token: string) {
  const expiresAt = blacklist.get(token)
  if (!expiresAt) {
    return false
  }
  if (expiresAt < Date.now()) {
    // 过期后自动清理
    blacklist.delete(token)
    return false
  }
  return true
}
