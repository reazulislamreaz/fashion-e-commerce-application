import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const appName = configService.get<string>('APP_NAME') ?? 'Easy Fashion API';

  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(
      'Easy Fashion Limited technical assessment API. Phase 0 establishes the foundation; business endpoints are added in later phases.',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Access Token (available in later phases)',
        in: 'header',
      },
      'bearer-auth',
    )
    .addTag('Health', 'Application health and readiness')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
