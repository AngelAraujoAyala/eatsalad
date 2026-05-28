import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items } = createOrderDto;

    if (items.length === 0) {
      throw new BadRequestException(
        'Una orden debe contener al menos un producto.',
      );
    }

    const productIds = items.map((item) => item.productId);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Buscamos los productos e incluimos sus ingredientes disponibles mapeados en la BD
      const dbProducts = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true, // Nos aseguramos de que no puedan pedir productos desactivados
        },
        include: {
          availableIngredients: true,
        },
      });

      if (dbProducts.length !== Array.from(new Set(productIds)).length) {
        throw new NotFoundException(
          'Uno o más productos seleccionados no existen o están inactivos.',
        );
      }

      // Mapeamos los productos por ID para acceso rápido O(1)
      const productMap = new Map<string, (typeof dbProducts)[0]>();
      dbProducts.forEach((product) => {
        productMap.set(product.id, product);
      });

      let orderTotal = 0;

      // 2. Procesar y validar cada ítem de la orden
      const orderItemsData = items.map((item) => {
        const dbProduct = productMap.get(item.productId);

        if (!dbProduct) {
          throw new NotFoundException(
            `Producto no encontrado: ${item.productId}`,
          );
        }

        // --- 🛡️ VALIDACIÓN DE INGREDIENTES PERSONALIZADOS ---
        // Extraemos todos los IDs de ingredientes enviados en el JSON configuration
        const sentIngredientIds: string[] = [];
        if (item.configuration && typeof item.configuration === 'object') {
          Object.values(item.configuration).forEach((value) => {
            if (Array.isArray(value)) {
              value.forEach((id) => {
                if (typeof id === 'string') sentIngredientIds.push(id);
              });
            }
          });
        }

        // Si mandaron ingredientes pero el producto NO es personalizable, rebota
        if (sentIngredientIds.length > 0 && !dbProduct.isCustomizable) {
          throw new BadRequestException(
            `El producto '${dbProduct.name}' no permite personalización, pero se enviaron ingredientes.`,
          );
        }

        // Si es personalizable, cruzamos que cada ID enviado exista en la tabla intermedia del producto
        if (dbProduct.isCustomizable && sentIngredientIds.length > 0) {
          const allowedIngredientIds = dbProduct.availableIngredients.map(
            (ai) => ai.ingredientId,
          );

          const hasInvalidIngredient = sentIngredientIds.some(
            (id) => !allowedIngredientIds.includes(id),
          );

          if (hasInvalidIngredient) {
            throw new BadRequestException(
              `Uno o más ingredientes seleccionados no están disponibles para el producto '${dbProduct.name}'.`,
            );
          }
        }
        // ----------------------------------------------------

        const currentPrice = Number(dbProduct.price);
        const itemSubtotal = currentPrice * item.quantity;
        orderTotal += itemSubtotal;

        return {
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: currentPrice,
          configuration: item.configuration,
        };
      });

      // 3. Crear la orden e insertar los ítems
      return tx.order.create({
        data: {
          total: orderTotal,
          items: {
            createMany: {
              data: orderItemsData,
            },
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc', // Las comandas más nuevas aparecen primero en el punto de venta
      },
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
    const order = await this.prisma.order.findUnique({
      where: { id },
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

    if (!order) {
      throw new NotFoundException(`La orden con el ID ${id} no existe.`);
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    // Validamos que exista la orden antes de cambiar el estado
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: { status: updateOrderStatusDto.status },
    });
  }
}
