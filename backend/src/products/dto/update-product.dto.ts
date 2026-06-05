import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// ✨ Al heredar limpiamente, adopta el nuevo @Transform que repara las reglas dinámicas
export class UpdateProductDto extends PartialType(CreateProductDto) {}
