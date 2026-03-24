import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { appEnv } from './config/env';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: appEnv.frontendUrl,
    credentials: true,
  });

  await app.listen(appEnv.port);
}
bootstrap();
