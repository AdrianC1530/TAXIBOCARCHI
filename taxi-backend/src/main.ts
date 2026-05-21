import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilitar CORS para que el frontend de React pueda hacer peticiones
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
