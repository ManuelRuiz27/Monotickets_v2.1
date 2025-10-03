import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from './common/config/config.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { S3Module } from './common/infra/s3/s3.module.js';
import { RedisModule } from './common/infra/redis/redis.module.js';

@Module({
  imports: [ConfigModule, RedisModule, S3Module, AuthModule, UsersModule]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
