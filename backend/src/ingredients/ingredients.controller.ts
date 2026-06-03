import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { FileInterceptor } from '@nestjs/platform-express';
// 1. 📦 Importa tu Enum o Tipo desde donde esté definido (ejemplo ficticio)
import { IngredientCategory } from '@prisma/client';

// 2. 🎯 Cambiamos 'string' por 'IngredientCategory'
interface CreateIngredientRaw {
  name: string;
  price?: string;
  isExtra?: string;
  isActive?: string;
  category?: IngredientCategory; // ✨ CORREGIDO
}

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() body: CreateIngredientRaw,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // 3. 🎯 Si 'BARRA' es un valor válido del Enum, úsalo directamente o como string si es una unión
    const cleanIngredientDto: CreateIngredientDto = {
      name: body.name,
      price: body.price ? parseFloat(body.price) : 0,
      isExtra: body.isExtra === 'true',
      isActive: body.isActive === 'true',
      category: body.category,
    };

    return this.ingredientsService.createWithImage(cleanIngredientDto, file);
  }

  @Get()
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ingredientsService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateIngredientRaw,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const cleanUpdateDto: UpdateIngredientDto = {
      name: body.name,
      price: body.price ? parseFloat(body.price) : 0,
      isExtra: body.isExtra === 'true',
      isActive: body.isActive === 'true',
      category: body.category, // ✨ CORREGIDO (Ya coinciden los tipos)
    };

    return this.ingredientsService.update(id, cleanUpdateDto, file);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ingredientsService.remove(id);
  }
}
