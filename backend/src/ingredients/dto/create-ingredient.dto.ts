import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { IngredientCategory } from '@prisma/client';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del ingrediente es obligatorio' })
  name!: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isExtra?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  category?: IngredientCategory;
}
