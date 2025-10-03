import { Global, Module } from '@nestjs/common';
import AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

const s3Provider = {
  provide: 'S3_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const minioConfig = configService.get('config.minio');
    if (!minioConfig) {
      throw new Error('MinIO configuration missing');
    }

    return new AWS.S3({
      endpoint: `${minioConfig.useSSL ? 'https' : 'http'}://${minioConfig.endpoint}:${minioConfig.port}`,
      accessKeyId: minioConfig.accessKey,
      secretAccessKey: minioConfig.secretKey,
      s3ForcePathStyle: true,
      signatureVersion: 'v4'
    });
  }
};

@Global()
@Module({
  providers: [s3Provider],
  exports: ['S3_CLIENT']
})
export class S3Module {}
