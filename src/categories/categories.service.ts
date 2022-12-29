import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlayersService } from 'src/players/players.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './interfaces/category.interface';
@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('category') private readonly categoryModel: Model<Category>,
    private readonly playersService: PlayersService,
  ) {}

  async createCategory(payload: CreateCategoryDto): Promise<Category> {
    const { category } = payload;

    const categoryExist = await this.categoryModel.findOne({ category }).exec();

    if (categoryExist) {
      throw new BadRequestException(`Categoria já cadastrada`);
    }

    const categoryCreated = new this.categoryModel(payload);
    return await categoryCreated.save();
  }

  async updateCategory(
    _id: string,
    payload: UpdateCategoryDto,
  ): Promise<Category> {
    const categoryExist = await this.categoryModel.findOne({ _id }).exec();

    if (!categoryExist) {
      throw new BadRequestException(`Categoria não existe`);
    }

    return this.categoryModel
      .findOneAndUpdate({ _id }, { $set: payload })
      .exec();
  }

  async assignCategoryPlayer(params: string[]): Promise<void> {
    const category = params['category'];
    const idPlayer = params[':idPlayer'];

    const [categoryExist, playerExist, playerAlreadyOnCategory] =
      await Promise.all([
        this.categoryModel.findOne({ category }).exec(),
        this.playersService.getPlayerById(idPlayer),
        this.categoryModel
          .find({ category })
          .where('players')
          .in(idPlayer)
          .exec(),
      ]);
    if (!categoryExist || !playerExist) {
      throw new NotFoundException('Categoria ou Jogador não encontrado');
    }

    if (playerAlreadyOnCategory.length > 0) {
      throw new BadRequestException('Jogador já cadastrado na categoria');
    }

    categoryExist.players.push(idPlayer);
    await this.categoryModel
      .findOneAndUpdate({ category }, { $set: categoryExist })
      .exec();
  }
  async getAllCategories(): Promise<Array<Category>> {
    return this.categoryModel.find().populate('players').exec();
  }

  async getCategoriesById(category: string): Promise<Category> {
    const categoryExist = this.categoryModel.findOne({ category }).exec();
    if (!categoryExist) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return categoryExist;
  }

  async consultPlayerCategory(playerId: any): Promise<Category> {
    const players = await this.playersService.getAllPlayers();

    const playerFilter = players.filter((player) => player._id == playerId);

    if (playerFilter.length == 0) {
      throw new BadRequestException(`O id ${playerId} não é um jogador!`);
    }

    return await this.categoryModel
      .findOne()
      .where('players')
      .in(playerId)
      .exec();
  }
}
