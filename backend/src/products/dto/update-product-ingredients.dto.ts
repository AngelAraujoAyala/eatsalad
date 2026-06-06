import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateProductIngredientsDto {
  @IsArray({ message: 'ingredientIds debe ser un arreglo' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de ingrediente debe ser un UUID válido',
  })
  @IsNotEmpty({
    each: true,
    message: 'El ID del ingrediente no puede estar vacío',
  })
  ingredientIds!: string[];
}
