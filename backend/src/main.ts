import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar CORS: Permite que tu frontend en React consuma tu API
  app.enableCors({
    origin: '*', // En producción, cambia esto por la URL de tu frontend (ej: 'https://eat-salad-front.vercel.app')
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Configurar Pipes Globales:
  // Esto debe ir ANTES de app.listen para que las validaciones funcionen en los endpoints
  app.setGlobalPrefix('api'); // Opcional: añade un prefijo a todas tus rutas, ej: localhost:3000/api/products

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Convierte los strings de los DTOs a sus tipos reales (number, boolean)
      whitelist: true, // Elimina cualquier campo enviado en el JSON que no esté en tu DTO
      forbidNonWhitelisted: true, // Lanza error si envían campos no permitidos
    }),
  );

  // 3. Iniciar el servidor
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend corriendo en: http://localhost:${port}/api`);
}
bootstrap();
