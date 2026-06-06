// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsController } from './products.controller';

@Module({
  imports: [PrismaModule],

  controllers: [ProductsController],

  providers: [ProductsService],

  // Opcional: Si otros módulos necesitaran usar este servicio,
  // tendrías que exportarlo aquí:
  // exports: [ProductsService],
})
export class ProductsModule {}
