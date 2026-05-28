import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // El truco mágico: mantiene la compatibilidad con tus servicios viejos y nuevos
  public readonly client = this;

  constructor() {
    // Lo dejamos vacío. Prisma por defecto busca solo la variable DATABASE_URL
    // en tu .env. Así evitamos pelearnos con los nombres de TypeScript.
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.error('Error al conectar la base de datos con Prisma:', error);
    }
  }
}
