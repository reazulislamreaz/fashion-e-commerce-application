import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { createValidationPipe } from './common/pipes/validation.pipe';

function parseCorsOrigins(raw: string) {
  const value = raw.trim();
  if (!value || value === '*') {
    return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, true);
    };
  }
  const allowed = value.split(',').map((o) => o.trim()).filter(Boolean);
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowed.includes(origin) || allowed.includes('*')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  };
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
  const swaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED') ?? true;

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    exposedHeaders: '*',
  });

  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''));
  app.useGlobalPipes(createValidationPipe());

  if (swaggerEnabled) {
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
  if (swaggerEnabled) {
    logger.log(`OpenAPI docs: http://localhost:${port}/docs`);
  }
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
   
  console.error(`Failed to start application: ${message}`);
  process.exit(1);
});
