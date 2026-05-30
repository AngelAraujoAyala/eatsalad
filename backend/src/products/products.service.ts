import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import 'multer';
import { UpdateProductIngredientsDto } from './dto/update-product-ingredients.dto';
import { Prisma } from '@prisma/client';

// 1. FORZAR CARGA DEL .ENV: Evita que Supabase truene por variables undefined al arrancar
dotenv.config();

@Injectable()
export class ProductsService {
  private supabase: SupabaseClient<any, any, any>;

  constructor(private prisma: PrismaService) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    // Validación preventiva clara
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'CRÍTICO: SUPABASE_URL o SUPABASE_KEY no están definidas en tu archivo .env',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // 1. OBTENER TODOS LOS PRODUCTOS ACTIVOS
  async findAll() {
    return this.prisma.product.findMany({
      include: {
        category: {
          select: { id: true, name: true },
        },
        availableIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  }

  // 2. OBTENER UN PRODUCTO POR ID
  async findOne(id: string) {
    const product = await this.prisma.client.product.findUnique({
      where: { id },
      include: {
        category: true,
        availableIngredients: { include: { ingredient: true } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  // 3. CREAR PRODUCTO (CON IMAGEN E INGREDIENTES)
  async create(dto: CreateProductDto, imageFile?: Express.Multer.File) {
    let imageUrl: string | null = null;

    if (imageFile) {
      imageUrl = await this.uploadImageToSupabase(imageFile);
    }

    // Extraemos TODAS las variables que vienen del FormData para limpiarlas
    // y evitar que el ...productData se las lleve sucias a Prisma
    const {
      ingredientsIds,
      categoryId,
      price,
      isActive,
      isCustomizable,
      maxProteins,
      maxIngredients,
      ...productData
    } = dto;

    // Unificación de ingredientes a Array seguro
    let normalizedIngredients: string[] = [];
    if (ingredientsIds) {
      normalizedIngredients = Array.isArray(ingredientsIds)
        ? ingredientsIds
        : [ingredientsIds];
    }

    try {
      return await this.prisma.client.product.create({
        data: {
          ...productData,
          // Casteos explícitos y seguros anti-FormData strings:
          price: price ? Number(price) : 0,
          maxProteins: maxProteins ? Number(maxProteins) : 0,
          maxIngredients: maxIngredients ? Number(maxIngredients) : 0,
          isActive: String(isActive) === 'true' || isActive === true,
          isCustomizable:
            String(isCustomizable) === 'true' || isCustomizable === true,
          imageUrl,
          category: {
            connect: { id: categoryId },
          },
          availableIngredients: {
            create: normalizedIngredients.map((id: string) => ({
              ingredientId: id,
            })),
          },
        },
        include: {
          category: true,
          availableIngredients: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Error: ${error instanceof Error ? error.message : String(error)} al crear el producto en la base de datos`,
      );
    }
  }

  private async uploadImageToSupabase(
    file: Express.Multer.File,
  ): Promise<string> {
    const originalName = file.originalname ?? 'image.png';
    const fileExt = originalName.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await this.supabase.storage
      .from('product-images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(
        `Error al subir imagen a Supabase: ${error.message}`,
      );
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  async updateIngredients(
    productId: string,
    updateDto: UpdateProductIngredientsDto,
  ) {
    const { ingredientIds } = updateDto;

    // 1. Validar que el producto exista y esté activo
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(
        `El producto con ID ${productId} no existe o está inactivo`,
      );
    }

    // 2. Si mandan ingredientes, validar que todos existan en la BD y estén activos
    if (ingredientIds.length > 0) {
      const dbIngredients = await this.prisma.ingredient.findMany({
        where: {
          id: { in: ingredientIds },
          isActive: true,
        },
      });

      if (dbIngredients.length !== Array.from(new Set(ingredientIds)).length) {
        throw new BadRequestException(
          'Uno o más IDs de ingredientes provistos no existen o están inactivos.',
        );
      }
    }

    // 3. Ejecutar la actualización relacional de forma atómica (Transacción limpia)
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // A) Limpiar los ingredientes que tenía asignados previamente
      await tx.productIngredient.deleteMany({
        where: { productId },
      });

      // B) Si el arreglo trae elementos, insertamos las nuevas relaciones
      if (ingredientIds.length > 0) {
        await tx.productIngredient.createMany({
          data: ingredientIds.map((ingId) => ({
            productId: productId,
            ingredientId: ingId,
          })),
        });
      }

      // C) Retornar el producto con sus ingredientes actualizados para confirmar al cliente
      return tx.product.findUnique({
        where: { id: productId },
        include: {
          availableIngredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    });
  }

  async update(
    id: string,
    dto: CreateProductDto,
    imageFile?: Express.Multer.File,
  ) {
    // 1. Verificar si el producto existe
    const existingProduct = await this.findOne(id);
    let imageUrl = existingProduct.imageUrl;

    // 2. Si subió nueva foto, se procesa
    if (imageFile) {
      imageUrl = await this.uploadImageToSupabase(imageFile);
    }

    try {
      // Mapeo explícito de propiedades para cumplir con las reglas estrictas de ESLint
      return await this.prisma.client.product.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          // FormData envía strings; aseguramos el casteo correcto
          isActive: String(dto.isActive) === 'true' || dto.isActive === true,
          isCustomizable:
            String(dto.isCustomizable) === 'true' ||
            dto.isCustomizable === true,
          maxProteins: dto.maxProteins ? Number(dto.maxProteins) : 0,
          maxIngredients: dto.maxIngredients ? Number(dto.maxIngredients) : 0,
          price: dto.price ? Number(dto.price) : 0,
          imageUrl,
          category: {
            connect: { id: dto.categoryId },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al actualizar el producto: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
