import { IsEnum } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message:
      'El estado debe ser uno de los siguientes: PENDIENTE, FINALIZADO o CANCELADO',
  })
  status!: OrderStatus;
}
