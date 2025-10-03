import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configSchema, type AppConfig } from './config.schema.js';

const loadConfig = () => {
  const parsed = configSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.format();
    throw new Error(`Invalid configuration: ${JSON.stringify(formatted)}`);
  }

  const env = parsed.data;

  const config: AppConfig = {
    env: env.NODE_ENV,
    httpPort: env.PORT,
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    minio: {
      endpoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
      useSSL: env.MINIO_USE_SSL
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRATION
    },
    refresh: {
      secret: env.REFRESH_SECRET,
      expiresIn: env.REFRESH_EXPIRATION
    },
    webOrigin: env.WEB_ORIGIN,
    sentryDsn: env.SENTRY_DSN,
    prismaLogLevel: env.PRISMA_LOG_LEVEL
  };

  return config;
};

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({ config: loadConfig() })]
    })
  ]
})
export class ConfigModule {}
