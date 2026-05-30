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

// Definimos la estructura real que llega desde el FormData de React
interface CreateIngredientRaw {
  name: string;
  price?: string;
  isExtra?: string;
  isActive?: string;
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
    const cleanIngredientDto: CreateIngredientDto = {
      name: body.name,
      price: body.price ? parseFloat(body.price) : 0,
      isExtra: body.isExtra === 'true',
      isActive: body.isActive === 'true',
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
  @UseInterceptors(FileInterceptor('file')) // Recuerda hacer append('file', ...) en React
  update(
    @Param('id', ParseUUIDPipe) id: string,
    // 2. Usamos tu interfaz "Raw" porque los datos vienen como string desde el FormData
    @Body() body: CreateIngredientRaw,
    // 3. Capturamos la imagen si es que el usuario decidió cambiarla (es opcional 'file?')
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // 4. Limpiamos y casteamos los strings a sus tipos reales
    const cleanUpdateDto: UpdateIngredientDto = {
      name: body.name,
      price: body.price ? parseFloat(body.price) : 0,
      isExtra: body.isExtra === 'true',
      isActive: body.isActive === 'true',
    };

    // 5. Le pasamos el ID, los datos limpios y el archivo de imagen al servicio
    // (Asegúrate de que tu service acepte el 'file' en su argumento si vas a procesar la nueva foto)
    return this.ingredientsService.update(id, cleanUpdateDto, file);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ingredientsService.remove(id);
  }
}
