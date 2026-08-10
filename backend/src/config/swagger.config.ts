import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const appName = configService.get<string>('APP_NAME') ?? 'Easy Fashion API';

  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(
      'Easy Fashion Limited technical assessment API. Includes JWT authentication, RBAC, and catalog management (categories, sizes, styles).',
    )
    .setVersion('0.4.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Access Token',
        in: 'header',
      },
      'bearer-auth',
    )
    .addTag('Health', 'Application health and readiness')
    .addTag('Auth', 'Registration, login, token refresh, logout, and profile')
    .addTag('Categories', 'Category catalog management')
    .addTag('Sizes', 'Size catalog management')
    .addTag('Styles', 'Style catalog management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
