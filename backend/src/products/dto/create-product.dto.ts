// src/products/dto/create-product.dto.ts
import {
  IsString,
  IsDecimal,
  IsBoolean,
  IsOptional,
  IsInt,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsDecimal()
  price!: number;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isCustomizable!: boolean;

  @IsOptional()
  @IsInt()
  maxProteins?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredientsIds?: string[];

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsInt()
  maxIngredients?: number;
}
