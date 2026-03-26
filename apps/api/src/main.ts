import 'dotenv/config';
import type { NextFunction, Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { appEnv } from './config/env';
import { authHandler } from './auth/better-auth';
import { SeedsService } from './seeds/seeds.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  app.enableCors({
    origin: appEnv.frontendUrl,
    credentials: true,
  });

  expressApp.use(
    /^\/auth\/.*/,
    (request: Request, response: Response, next: NextFunction) => {
      const requestOrigin = request.headers.origin;

      if (requestOrigin && requestOrigin === appEnv.frontendUrl) {
        response.setHeader('Access-Control-Allow-Origin', requestOrigin);
        response.setHeader('Vary', 'Origin');
        response.setHeader('Access-Control-Allow-Credentials', 'true');
        response.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization',
        );
        response.setHeader(
          'Access-Control-Allow-Methods',
          'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        );
      }

      if (request.method === 'OPTIONS') {
        response.status(204).end();
        return;
      }

      next();
    },
  );

  expressApp.all(/^\/auth\/.*/, authHandler);

  if (appEnv.autoSeed) {
    const seedService = app.get(SeedsService);
    await seedService.ensureSeeded();
  }

  await app.listen(appEnv.port);
}
bootstrap();
