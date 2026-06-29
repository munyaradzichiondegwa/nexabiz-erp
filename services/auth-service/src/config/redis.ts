import { createClient } from "redis"
import { logger } from "./logger"

export let redisClient: ReturnType<typeof createClient>

export async function connectRedis() {
  redisClient = createClient({ url: process.env.REDIS_URL })
  redisClient.on("error", (err) => logger.error("Redis error", err))
  await redisClient.connect()
  logger.info("Redis connected")
}

export async function setToken(key: string, value: string, ttlSeconds: number) {
  await redisClient.setEx(`token:${key}`, ttlSeconds, value)
}

export async function getToken(key: string): Promise<string | null> {
  return redisClient.get(`token:${key}`)
}

export async function deleteToken(key: string) {
  await redisClient.del(`token:${key}`)
}

export async function blacklistToken(jti: string, ttlSeconds: number) {
  await redisClient.setEx(`blacklist:${jti}`, ttlSeconds, "1")
}

export async function isBlacklisted(jti: string): Promise<boolean> {
  const val = await redisClient.get(`blacklist:${jti}`)
  return val === "1"
}
