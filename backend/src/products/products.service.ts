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
import { UpdateProductDto } from './dto/update-product.dto';

// FORZAR CARGA DEL .ENV: Evita que Supabase truene por variables undefined al arrancar
dotenv.config();

@Injectable()
export class ProductsService {
  private supabase: SupabaseClient<any, any, any>;

  constructor(private prisma: PrismaService) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

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

    const {
      ingredientsIds,
      categoryId,
      price,
      isActive,
      isCustomizable,
      maxProteins,
      maxAderezos,
      maxBarra,
      maxComplements, // Directo en inglés desde el DTO
      ...productData
    } = dto;

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
          price: price ? Number(price) : 0,
          maxProteins: maxProteins ? Number(maxProteins) : 0,
          maxAderezos: maxAderezos ? Number(maxAderezos) : 0,
          maxBarra: maxBarra ? Number(maxBarra) : 0,
          maxComplements: maxComplements ? Number(maxComplements) : 0,
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
        `Error al crear el producto: ${error instanceof Error ? error.message : String(error)}`,
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

  // 4. ACTUALIZAR EXCLUSIVA DE INGREDIENTES (RUTA INDEPENDIENTE)
  async updateIngredients(
    productId: string,
    updateDto: UpdateProductIngredientsDto,
  ) {
    const { ingredientIds } = updateDto;

    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(
        `El producto con ID ${productId} no existe o está inactivo`,
      );
    }

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

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.productIngredient.deleteMany({
        where: { productId },
      });

      if (ingredientIds.length > 0) {
        await tx.productIngredient.createMany({
          data: ingredientIds.map((ingId) => ({
            productId: productId,
            ingredientId: ingId,
          })),
        });
      }

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

  // 5. ACTUALIZAR PRODUCTO (MAESTRO DESDE EL MODAL DEL FRONTEND)
  async update(
    id: string,
    dto: UpdateProductDto,
    imageFile?: Express.Multer.File,
  ) {
    const existingProduct = await this.findOne(id);
    let imageUrl = existingProduct.imageUrl;

    if (imageFile) {
      imageUrl = await this.uploadImageToSupabase(imageFile);
    }

    const { ingredientsIds, categoryId, ...restDto } = dto;

    const updateData: Prisma.ProductUpdateInput = {
      name: restDto.name,
      description: restDto.description,
      imageUrl,
    };

    if (restDto.isActive !== undefined) {
      updateData.isActive =
        String(restDto.isActive) === 'true' || restDto.isActive === true;
    }
    if (restDto.isCustomizable !== undefined) {
      updateData.isCustomizable =
        String(restDto.isCustomizable) === 'true' ||
        restDto.isCustomizable === true;
    }
    if (restDto.price !== undefined) updateData.price = Number(restDto.price);

    // Mapeo directo uno a uno con el DTO en inglés
    if (restDto.maxProteins !== undefined)
      updateData.maxProteins = Number(restDto.maxProteins);
    if (restDto.maxAderezos !== undefined)
      updateData.maxAderezos = Number(restDto.maxAderezos);
    if (restDto.maxBarra !== undefined)
      updateData.maxBarra = Number(restDto.maxBarra);
    if (restDto.maxComplements !== undefined)
      updateData.maxComplements = Number(restDto.maxComplements);

    if (categoryId) {
      updateData.category = {
        connect: { id: categoryId },
      };
    }

    try {
      // Si el modal del frontend envía el arreglo de checkboxes de ingredientes
      if (ingredientsIds !== undefined) {
        let normalizedIngredients: string[] = [];
        if (ingredientsIds) {
          normalizedIngredients = Array.isArray(ingredientsIds)
            ? ingredientsIds
            : [ingredientsIds];
        }

        return await this.prisma.$transaction(async (tx) => {
          // A) Limpiar los ingredientes anteriores del producto
          await tx.productIngredient.deleteMany({ where: { productId: id } });

          // B) Vincular los nuevos checkboxes que vienen seleccionados
          if (normalizedIngredients.length > 0) {
            await tx.productIngredient.createMany({
              data: normalizedIngredients.map((ingId) => ({
                productId: id,
                ingredientId: ingId,
              })),
            });
          }

          // C) Actualizar los datos del producto
          return tx.product.update({
            where: { id },
            data: updateData,
            include: {
              category: true,
              availableIngredients: { include: { ingredient: true } },
            },
          });
        });
      }

      // Si el formulario no envió ingredientes, hacemos el update directo clásico
      return await this.prisma.client.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          availableIngredients: { include: { ingredient: true } },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al actualizar el producto: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
