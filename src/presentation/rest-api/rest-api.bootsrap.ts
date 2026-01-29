import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RestApiModule } from './rest-api.module';

async function bootstrap() {
  const app = await NestFactory.create(RestApiModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Wavo Route Solver API')
    .setDescription(
      'API pour calculer les itinéraires les plus rapides entre les villes en tenant compte de la météo et des contraintes',
    )
    .setVersion('1.0')
    .addTag('routes', "Endpoints pour le calcul d'itinéraires")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `Swagger documentation available at: http://localhost:${process.env.PORT ?? 3000}/docs`,
  );
}

void bootstrap();
