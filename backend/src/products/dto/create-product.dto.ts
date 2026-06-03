import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  price!: number; // Obligatorio para alinearse con tu modelo de Prisma

  @IsString()
  categoryId!: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isCustomizable?: boolean;

  // Límites específicos para la barra de ensaladas tal cual están en Prisma
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  maxProteins?: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  maxAderezos?: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  maxBarra?: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  maxComplements?: number; // 🔥 Cambiado a inglés, igualito a tu schema.prisma

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  ingredientsIds?: string | string[];
}
