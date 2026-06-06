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
import { CombosService } from './combos.service';
import { CreateComboDto, ComboItemDto } from './dto/create-combo.dto'; // 👈 Importamos también ComboItemDto para el cast
import { FileInterceptor } from '@nestjs/platform-express';

interface CreateComboRaw {
  name: string;
  description?: string;
  price: string;
  isActive?: string;
  items: string;
}

@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() body: CreateComboRaw,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const cleanComboDto: CreateComboDto = {
      name: body.name,
      description: body.description || undefined, // 👈 SOLUCIÓN: Cambiado 'null' por 'undefined' para alinearse al DTO
      price: parseFloat(body.price),
      isActive: body.isActive === 'true',
      // 👈 SOLUCIÓN: Agregamos el cast explícito 'as ComboItemDto[]' para eliminar el tipo 'any' que arroja JSON.parse
      items: body.items ? (JSON.parse(body.items) as ComboItemDto[]) : [],
    };

    return this.combosService.createWithImage(cleanComboDto, file);
  }

  @Get()
  findAll() {
    return this.combosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.combosService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateComboRaw,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const cleanUpdateDto: CreateComboDto = {
      name: body.name,
      description: body.description || undefined, // 👈 SOLUCIÓN: Cambiado 'null' por 'undefined'
      price: parseFloat(body.price),
      isActive: body.isActive === 'true',
      // 👈 SOLUCIÓN: Agregamos el cast explícito 'as ComboItemDto[]'
      items: body.items ? (JSON.parse(body.items) as ComboItemDto[]) : [],
    };

    return this.combosService.update(id, cleanUpdateDto, file);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.combosService.remove(id);
  }
}
