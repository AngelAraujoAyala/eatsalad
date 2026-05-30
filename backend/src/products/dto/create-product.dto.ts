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

  // 1. Convertir el precio de string a número flotante
  @Transform(({ value }) => Number(value))
  @IsNumber()
  price?: number;

  @IsString()
  categoryId!: string;

  // 2. Convertir los booleanos de texto ("true"/"false") a booleanos reales
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isCustomizable?: boolean;

  // 3. Convertir strings a enteros para la barra de ensaladas
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  maxProteins?: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  maxIngredients?: number;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  ingredientsIds?: string | string[];
}
