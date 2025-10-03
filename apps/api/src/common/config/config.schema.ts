import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().url(),
  MINIO_ENDPOINT: z.string(),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default('15m'),
  REFRESH_SECRET: z.string().min(32),
  REFRESH_EXPIRATION: z.string().default('30d'),
  WEB_ORIGIN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  PRISMA_LOG_LEVEL: z.string().optional()
});

export type AppConfig = {
  env: string;
  httpPort: number;
  databaseUrl: string;
  redisUrl: string;
  minio: {
    endpoint: string;
    port: number;
    accessKey: string;
    secretKey: string;
    useSSL: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  refresh: {
    secret: string;
    expiresIn: string;
  };
  webOrigin?: string;
  sentryDsn?: string;
  prismaLogLevel?: string;
};
