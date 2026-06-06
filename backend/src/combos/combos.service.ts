import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { Prisma } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class CombosService {
  // Inicialización de Supabase idéntica a tu IngredientsService
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
  );

  constructor(private readonly prisma: PrismaService) {}

  async createWithImage(
    createComboDto: CreateComboDto,
    file: Express.Multer.File,
  ) {
    const { name, description, price, isActive, items } = createComboDto;
    let imageUrl: string | null = null;

    if (file) {
      try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `combos/${fileName}`; // Guardado en carpeta virtual combos/

        const { error: storageError } = await this.supabase.storage
          .from('ingredients') // Puedes usar tu mismo bucket principal si ahí centralizas el menú
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (storageError) throw new Error(storageError.message);

        const { data: urlData } = this.supabase.storage
          .from('ingredients')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      } catch (error: any) {
        console.error('Error al procesar imagen de combo:', error);
        throw new InternalServerErrorException(
          'No se pudo subir la imagen del combo.',
        );
      }
    }

    return this.prisma.combo.create({
      data: {
        name,
        description,
        price,
        isActive: isActive ?? true,
        imageUrl,
        items: {
          createMany: {
            data: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  async findAll() {
    // Nota: Mantengo tu regla de negocio de retornar solo activos por defecto
    return this.prisma.combo.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    // Cambiado a findUnique para permitir reactivación segura como en Ingredients
    const combo = await this.prisma.combo.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!combo) {
      throw new NotFoundException(`Combo con el ID ${id} no fue encontrado`);
    }

    return combo;
  }

  async update(
    id: string,
    updateComboDto: CreateComboDto,
    file?: Express.Multer.File,
  ) {
    // 1. Buscamos existencia directa (Reactivación segura)
    await this.findOne(id);

    const { name, description, price, isActive, items } = updateComboDto;

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const dataToUpdate: Prisma.ComboUpdateInput = {};

      if (name !== undefined) dataToUpdate.name = name;
      if (description !== undefined) dataToUpdate.description = description;
      if (price !== undefined) dataToUpdate.price = price;
      if (isActive !== undefined) dataToUpdate.isActive = isActive;

      // 2. Procesamiento de imagen opcional
      if (file) {
        try {
          const fileExt = file.originalname.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          const filePath = `combos/${fileName}`;

          const { error: storageError } = await this.supabase.storage
            .from('ingredients')
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: true,
            });

          if (storageError) throw new Error(storageError.message);

          const { data: urlData } = this.supabase.storage
            .from('ingredients')
            .getPublicUrl(filePath);

          dataToUpdate.imageUrl = urlData.publicUrl;
        } catch (error) {
          console.error('Error al actualizar imagen de combo:', error);
          throw new InternalServerErrorException(
            'No se pudo reemplazar la imagen del combo.',
          );
        }
      }

      // Actualizar datos base del combo
      await tx.combo.update({
        where: { id },
        data: dataToUpdate,
      });

      // 3. Estrategia Clear & Replace si se envían ítems
      if (items) {
        await tx.comboItem.deleteMany({ where: { comboId: id } });
        await tx.comboItem.createMany({
          data: items.map((item) => ({
            comboId: id,
            productId: item.productId,
            quantity: item.quantity,
          })),
        });
      }

      return tx.combo.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
        },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.combo.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
