import {
  Controller,
  Get,
  Post,
  Body,
  Patch, // Usamos Patch en lugar de Put
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// Definimos la estructura real que llega desde el FormData del Frontend
interface CreateCategoryRaw {
  name: string;
}

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() body: CreateCategoryRaw,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const cleanCategoryDto: CreateCategoryDto = {
      name: body.name,
    };

    // Delegamos la subida de imagen a Supabase dentro del servicio
    return this.categoriesService.createWithImage(cleanCategoryDto, file);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id') // Mantenemos el método PATCH para actualizaciones parciales
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateCategoryRaw,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const cleanUpdateDto: UpdateCategoryDto = {
      name: body.name,
    };

    // Pasamos el ID, datos parciales limpios y el archivo opcional al servicio
    return this.categoriesService.update(id, cleanUpdateDto, file);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
