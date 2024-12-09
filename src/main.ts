import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeAuxiliaryServices } from './record/auxiliary-services'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  setupSwagger(app);

  await initializeAuxiliaryServices();
  const port = process.env.PORT || 4500;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}


function setupSwagger(app) {
  const config = new DocumentBuilder()
    .setTitle('Your Project API')
    .setDescription('API documentation for your project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
}

bootstrap();
