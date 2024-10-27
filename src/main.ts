import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Your Project API')
    .setDescription('API documentation for your project')
    .setVersion('1.0')
    .addBearerAuth() // If using JWT authentication
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000', // Frontend origin
    credentials: true, // Allow cookies if using them
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // The docs will be available at /api-docs

  await app.listen(4500);
}
bootstrap();