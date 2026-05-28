import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del ingrediente es obligatorio' })
  name!: string;

  @IsNumber()
  @IsOptional()
  price?: number;
}
