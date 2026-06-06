import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { IngredientCategory } from '@prisma/client';

export class ProductRuleDto {
  @IsEnum(IngredientCategory, {
    message: `La categoría debe ser uno de los siguientes valores: ${Object.values(IngredientCategory).join(', ')}`,
  })
  category!: IngredientCategory;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0, { message: 'La cantidad mínima no puede ser menor a 0' })
  minQuantity!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0, { message: 'La cantidad máxima no puede ser menor a 0' })
  maxQuantity!: number;
}

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  price!: number;

  @IsString()
  categoryId!: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isCustomizable?: boolean;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Este campo lo asignaremos nosotros en el servicio después de subir la imagen.
  // Ya no vendrá contaminado desde el FormData del frontend.
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  ingredientsIds?: string | string[];

  @IsOptional()
  @Transform(({ value }) => {
    // 🔄 Si viene como string (FormData), lo parseamos e instanciamos con plainToInstance
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
          ? parsed.map((item) => plainToInstance(ProductRuleDto, item))
          : [];
      } catch {
        return [];
      }
    }
    // 🔄 Si ya viene como arreglo (por si acaso haces peticiones JSON directas en Postman)
    if (Array.isArray(value)) {
      return value.map((item) => plainToInstance(ProductRuleDto, item));
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductRuleDto)
  rules?: ProductRuleDto[];

  @IsOptional()
  file?: any;
}
