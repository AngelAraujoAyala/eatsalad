import {
  IsString,
  IsNumber,
  IsPositive,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsObject,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '@prisma/client';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsObject()
  configuration!: Record<string, string[]>;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del cliente es requerido' })
  customerName!: string;

  @IsEnum(ServiceType, {
    message:
      'El tipo de servicio debe ser uno de los siguientes: COMEDOR o RECOGER',
  })
  serviceType!: ServiceType;

  @ValidateIf((o: CreateOrderDto) => o.serviceType === 'RECOGER')
  @IsString()
  @IsNotEmpty({
    message:
      'La hora de recogida es obligatoria cuando el servicio es para llevar/recoger',
  })
  pickupTime?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
