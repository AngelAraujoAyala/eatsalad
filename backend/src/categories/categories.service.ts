import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.client.category.findMany({
      include: { products: true },
    });
  }

  async create(dto: CreateCategoryDto, imageUrl?: string) {
    return await this.prisma.client.category.create({
      data: {
        name: dto.name,
        imageUrl: imageUrl || null, // <-- Guardamos la URL de la imagen
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.client.category.delete({
      where: { id },
    });
  }
}
