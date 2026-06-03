import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductIngredientsDto } from './dto/update-product-ingredients.dto';
import { UpdateProductDto } from './dto/update-product.dto'; // 🔥 Importamos el DTO de actualización

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file')) // El frontend debe enviar el archivo bajo el campo 'file'
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        // Validación extra para asegurar que sea imagen y no pese más de 2MB
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: false, // Ponlo en true si la imagen es obligatoria
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, file);
  }

  @Patch(':id/ingredients')
  updateIngredients(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductIngredientsDto: UpdateProductIngredientsDto,
  ) {
    return this.productsService.updateIngredients(
      id,
      updateProductIngredientsDto,
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto, // 🔥 Cambiado a UpdateProductDto para permitir actualizaciones parciales
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<unknown> {
    // El uso de updateProductDto aquí evita que falle por campos faltantes durante la edición
    return this.productsService.update(id, updateProductDto, file);
  }
}
