import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIngredientDto: CreateIngredientDto) {
    const { name, price } = createIngredientDto;

    // Lógica automática: si el precio es mayor a 0, significa que es un extra cobrable
    const isExtra = price && price > 0 ? true : false;

    return this.prisma.ingredient.create({
      data: {
        name,
        price: price ?? 0,
        isExtra,
      },
    });
  }

  async findAll() {
    // Retorna solo los ingredientes que estén activos en el sistema
    return this.prisma.ingredient.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }, // Ordenados alfabéticamente
    });
  }

  async findOne(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient || !ingredient.isActive) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }

    return ingredient;
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto) {
    // Validamos primero que el ingrediente exista
    await this.findOne(id);

    const { name, price } = updateIngredientDto;

    // 💡 Cambiamos 'any' por el tipo oficial de Prisma para updates
    const dataToUpdate: Prisma.IngredientUpdateInput = {};

    if (name !== undefined) dataToUpdate.name = name;

    if (price !== undefined) {
      dataToUpdate.price = price;
      dataToUpdate.isExtra = price > 0; // Recalcula si ahora pasa a ser extra o no
    }

    return this.prisma.ingredient.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string) {
    // Validamos que exista antes de intentar desactivar
    await this.findOne(id);

    // Hacemos un Soft Delete cambiando isActive a false
    return this.prisma.ingredient.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
