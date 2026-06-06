import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { createClient } from '@supabase/supabase-js';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  // Inicializamos el cliente de Supabase exactamente igual que en ingredientes
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
  );

  constructor(private readonly prisma: PrismaService) {}

  // POST /categories - Crear con imagen
  async createWithImage(dto: CreateCategoryDto, file: Express.Multer.File) {
    let imageUrl: string | null = null;

    if (file) {
      try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `categories/${fileName}`;

        const { error: storageError } = await this.supabase.storage
          .from('categories') // Asegúrate de tener un bucket llamado 'categories' en Supabase
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (storageError) {
          throw new InternalServerErrorException(
            `Error en Supabase Storage: ${storageError.message}`,
          );
        }

        const { data: urlData } = this.supabase.storage
          .from('categories')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
        throw new InternalServerErrorException(
          'No se pudo subir la imagen de la categoría.',
        );
      }
    }

    return this.prisma.client.category.create({
      data: {
        name: dto.name,
        imageUrl: imageUrl,
      },
    });
  }

  // GET /categories
  async findAll() {
    return await this.prisma.client.category.findMany({
      include: { products: true },
    });
  }

  // GET /categories/:id
  async findOne(id: string) {
    const category = await this.prisma.client.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  // PATCH /categories/:id
  async update(id: string, dto: UpdateCategoryDto, file?: Express.Multer.File) {
    // Validamos primero que la categoría exista en la base de datos
    const category = await this.prisma.client.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    // 1. Usamos el tipo real generado por Prisma en lugar de 'any'
    const dataToUpdate: Prisma.CategoryUpdateInput = {};
    if (dto.name !== undefined) dataToUpdate.name = dto.name;

    if (file) {
      try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `categories/${fileName}`;

        const { error: storageError } = await this.supabase.storage
          .from('categories')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (storageError) {
          throw new InternalServerErrorException(
            `Error al reemplazar en Supabase Storage: ${storageError.message}`,
          );
        }

        const { data: urlData } = this.supabase.storage
          .from('categories')
          .getPublicUrl(filePath);

        // 2. Ahora TypeScript sabe exactamente qué es 'imageUrl'
        dataToUpdate.imageUrl = urlData.publicUrl;
      } catch (error) {
        console.error('Error al procesar la nueva imagen en update:', error);
        throw new InternalServerErrorException(
          'No se pudo subir la nueva imagen de la categoría.',
        );
      }
    }

    // 3. La asignación a Prisma ahora es 100% segura y libre de errores de linter
    return await this.prisma.client.category.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  // DELETE /categories/:id
  async remove(id: string) {
    const category = await this.prisma.client.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return await this.prisma.client.category.delete({
      where: { id },
    });
  }
}
