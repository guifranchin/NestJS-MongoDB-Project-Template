import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { Player } from './interfaces/player.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdatePlayerDto } from './dtos/update-player.dto';

@Injectable()
export class PlayersService {
  private players: Player[];
  private readonly logger = new Logger(PlayersService.name);

  constructor(
    @InjectModel('Player') private readonly playerModel: Model<Player>,
  ) {}
  async createUpdatePlayer(payload: CreatePlayerDto): Promise<void> {
    this.logger.log('createPlayerDto', payload);
    const { email } = payload;
    const playerFounded = await this.playerModel.findOne({ email }).exec();
    if (playerFounded) {
      throw new BadRequestException('Usuario com e-mail já existe');
    }

    await this.create(payload);
  }

  private async create(payload: CreatePlayerDto): Promise<Player> {
    const player = new this.playerModel(payload);
    return await player.save();
  }

  async updateUser(_id: string, payload: UpdatePlayerDto): Promise<Player> {
    this.logger.log('createPlayerDto', payload);
    return await this.playerModel
      .findOneAndUpdate({ _id }, { $set: payload })
      .exec();
  }

  async getAllPlayers(): Promise<Player[]> {
    return this.playerModel.find().exec();
  }

  async getPlayerByEmail(email: string): Promise<Player> {
    const playerFounded = await this.playerModel.findOne({ email }).exec();
    if (playerFounded === undefined) {
      throw new NotFoundException('Usuario não encontrado');
    }

    return playerFounded;
  }

  async getPlayerById(_id: string): Promise<Player> {
    const playerFounded = await this.playerModel.findOne({ _id }).exec();
    if (playerFounded === undefined) {
      throw new NotFoundException('Usuario não encontrado');
    }

    return playerFounded;
  }

  async deleteUserByEmail(email: string): Promise<any> {
    const playerFounded = await this.playerModel.findOne({ email }).exec();
    if (playerFounded === undefined) {
      throw new NotFoundException('Usuario não encontrado');
    }

    return await this.playerModel.deleteOne({ email }).exec();
  }
}
