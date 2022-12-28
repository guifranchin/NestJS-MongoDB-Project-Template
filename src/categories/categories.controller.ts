import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './interfaces/category.interface';

@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriaService: CategoriesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createCategory(@Body() payload: CreateCategoryDto): Promise<Category> {
    return await this.categoriaService.createCategory(payload);
  }

  @Get()
  async getCategories(): Promise<Array<Category>> {
    return await this.categoriaService.getAllCategories();
  }

  @Get('/:category')
  async getCategoriesById(
    @Param('category') category: string,
  ): Promise<Category> {
    return await this.categoriaService.getCategoriesById(category);
  }

  @Put('/:category')
  @UsePipes(ValidationPipe)
  async updateCategory(
    @Body() payload: UpdateCategoryDto,
    @Param('category') category: string,
  ) {
    await this.categoriaService.updateCategory(category, payload);
  }

  @Post(':/category/players/:idPlayer')
  async assignCategoryPlayer(@Param() params: string[]): Promise<void> {
    return await this.categoriaService.assignCategoryPlayer(params);
  }
}
