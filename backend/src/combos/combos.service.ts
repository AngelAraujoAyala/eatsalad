import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta la ruta según tu estructura real
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CombosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createComboDto: CreateComboDto) {
    const { name, price, items } = createComboDto;

    return this.prisma.combo.create({
      data: {
        name,
        price,
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
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findAll() {
    // Regla de negocio: Solo retornar combos activos (Soft Delete)
    return this.prisma.combo.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const combo = await this.prisma.combo.findFirst({
      where: { id, isActive: true },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!combo) {
      throw new NotFoundException(
        `Combo con el ID ${id} no fue encontrado o está inactivo`,
      );
    }

    return combo;
  }

  async update(id: string, updateComboDto: UpdateComboDto) {
    // Verificamos primero la existencia del combo activo
    await this.findOne(id);

    const { name, price, items } = updateComboDto;

    // Manejo seguro transaccional para evitar inconsistencias y cumplir con el linter anti-any
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updateData: Prisma.ComboUpdateInput = {};
      if (name !== undefined) updateData.name = name;
      if (price !== undefined) updateData.price = price;

      // Actualizar datos del combo base
      await tx.combo.update({
        where: { id },
        data: updateData,
      });

      // Si se enviaron nuevos ítems, reemplazamos la colección de la tabla intermedia
      if (items) {
        // 1. Limpiar relaciones viejas
        await tx.comboItem.deleteMany({
          where: { comboId: id },
        });

        // 2. Insertar las nuevas relaciones
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
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async remove(id: string) {
    // Validamos existencia antes de proceder
    await this.findOne(id);

    // Regla de negocio: Borrado lógico cambiando isActive a false
    return this.prisma.combo.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
