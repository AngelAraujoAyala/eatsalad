import {
  IsString,
  IsNumber,
  IsPositive,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ComboItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;
}

export class CreateComboDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboItemDto)
  items!: ComboItemDto[];
}
