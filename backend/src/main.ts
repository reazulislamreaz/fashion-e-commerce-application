import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { createValidationPipe } from './common/pipes/validation.pipe';

function parseCorsOrigins(raw: string): string[] | boolean {
  const value = raw.trim();
  if (!value) {
    return false;
  }
  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');
  const apiPrefix = configService.getOrThrow<string>('API_PREFIX');
  const corsOrigin = configService.getOrThrow<string>('CORS_ORIGIN');
  const bodyLimit = configService.get<string>('BODY_LIMIT') ?? '1mb';
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';

  app.use(helmet());
  app.use(compression());
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  app.enableCors({
    origin: parseCorsOrigins(corsOrigin),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''));
  app.useGlobalPipes(createValidationPipe());

  if (nodeEnv !== 'production') {
    setupSwagger(app);
  }

  await app.listen(port);

  const logger = app.get(Logger);
  const normalizedPrefix = apiPrefix.replace(/^\//, '');
  logger.log(
    `Application listening on http://localhost:${port}/${normalizedPrefix}`,
  );
  logger.log(
    `Health check: http://localhost:${port}/${normalizedPrefix}/health`,
  );
  if (nodeEnv !== 'production') {
    logger.log(`OpenAPI docs: http://localhost:${port}/docs`);
  }
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
   
  console.error(`Failed to start application: ${message}`);
  process.exit(1);
});
