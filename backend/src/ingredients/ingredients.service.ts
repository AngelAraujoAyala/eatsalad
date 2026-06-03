import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Prisma } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class IngredientsService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
  );

  constructor(private readonly prisma: PrismaService) {}

  // POST /ingredients - Crear con imagen y categoría
  async createWithImage(
    createIngredientDto: CreateIngredientDto,
    file: Express.Multer.File,
  ) {
    const { name, price, isActive, category } = createIngredientDto;

    const isExtra = price && price > 0 ? true : false;
    let imageUrl: string | null = null;

    if (file) {
      try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `ingredients/${fileName}`;

        const { error: storageError } = await this.supabase.storage
          .from('ingredients')
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
          .from('ingredients')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
        throw new InternalServerErrorException(
          'No se pudo subir la imagen del ingrediente.',
        );
      }
    }

    return this.prisma.ingredient.create({
      data: {
        name,
        price: price ?? 0,
        isExtra,
        isActive: isActive ?? true,
        imageUrl,
        category,
      },
    });
  }

  // GET /ingredients
  async findAll() {
    return this.prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // GET /ingredients/:id
  async findOne(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient || !ingredient.isActive) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }

    return ingredient;
  }

  // PUT /ingredients/:id - Actualizar con soporte para categoría
  async update(
    id: string,
    updateIngredientDto: UpdateIngredientDto,
    file?: Express.Multer.File,
  ) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }

    const { name, price, isActive, category } = updateIngredientDto;
    const dataToUpdate: Prisma.IngredientUpdateInput = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;

    // 🚀 CORREGIDO: Eliminado 'as any'
    if (category !== undefined) dataToUpdate.category = category;

    if (price !== undefined) {
      dataToUpdate.price = price;
      dataToUpdate.isExtra = price > 0;
    }

    if (file) {
      try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `ingredients/${fileName}`;

        const { error: storageError } = await this.supabase.storage
          .from('ingredients')
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
          .from('ingredients')
          .getPublicUrl(filePath);

        dataToUpdate.imageUrl = urlData.publicUrl;
      } catch (error) {
        console.error('Error al procesar la nueva imagen en update:', error);
        throw new InternalServerErrorException(
          'No se pudo subir la nueva imagen del ingrediente.',
        );
      }
    }

    return this.prisma.ingredient.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  // DELETE /ingredients/:id
  async remove(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }

    return this.prisma.ingredient.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
