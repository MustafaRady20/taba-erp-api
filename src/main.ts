import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin:[
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://elmahdy-pied.vercel.app/",
      "http://tabavip.com",
      "https://www.tabavip.com",
      "https://elmahdy-erp-frontend.vercel.app"
    ]
  })
  const config = new DocumentBuilder()
    .setTitle('El Mahdy Internal System')
    .setDescription('API documentation for El-Mahdy-internal-system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Server is running on: http://localhost:${process.env.PORT}`)
  console.log(`Swagger docs available at: http://localhost:${process.env.PORT}/api-docs`)
}
bootstrap();
