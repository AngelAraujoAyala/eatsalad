import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // CORREGIDO: Accedemos a .client
    return await this.prisma.client.category.findMany({
      include: { products: true },
    });
  }

  async create(dto: CreateCategoryDto) {
    // CORREGIDO: Accedemos a .client
    return await this.prisma.client.category.create({
      data: { name: dto.name },
    });
  }

  async remove(id: string) {
    // CORREGIDO: Accedemos a .client
    return await this.prisma.client.category.delete({
      where: { id },
    });
  }
}
