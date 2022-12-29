import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriesService } from 'src/categories/categories.service';
import { PlayersService } from 'src/players/players.service';
import { AssignDeAssignChallengeMatch } from './dtos/assign-game-challenge.dto';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { ChallengeStatus } from './interfaces/challenges-status.enum';
import { Challenge, Match } from './interfaces/challenges.interface';
@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel('Challenge') private readonly challengeModel: Model<Challenge>,
    @InjectModel('Match') private readonly matchModel: Model<Match>,
    private readonly playersService: PlayersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  private readonly logger = new Logger(CategoriesService.name);

  async createChallenge(payload: CreateChallengeDto): Promise<Challenge> {
    const players = await this.playersService.getAllPlayers();

    payload.players.map((playerDto) => {
      const playerFilter = players.filter(
        (player) => player._id == playerDto._id,
      );

      if (playerFilter.length == 0) {
        throw new BadRequestException(
          `O id ${playerDto._id} não é um jogador!`,
        );
      }
    });

    const requesterIsMatchPlayer = await payload.players.filter(
      (player) => player._id == payload.requester,
    );

    this.logger.log(`Requester is MatchPlayer: ${requesterIsMatchPlayer}`);

    if (requesterIsMatchPlayer.length == 0) {
      throw new BadRequestException(
        `O solicitante deve ser um jogador da partida!`,
      );
    }

    const categoryOfPlayer = await this.categoriesService.consultPlayerCategory(
      payload.requester,
    );

    if (!categoryOfPlayer) {
      throw new BadRequestException(
        `O solicitante precisa estar registrado em uma categoria!`,
      );
    }

    const challengeCreated = new this.challengeModel(payload);
    challengeCreated.category = categoryOfPlayer.category;
    challengeCreated.dateTimeRequest = new Date();

    challengeCreated.status = ChallengeStatus.PENDING;
    this.logger.log(`Desafio Criado: ${JSON.stringify(challengeCreated)}`);
    return await challengeCreated.save();
  }

  async consultAllChallenges(): Promise<Array<Challenge>> {
    return await this.challengeModel
      .find()
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async consultChallengesOfOnePlayer(_id: any): Promise<Array<Challenge>> {
    const players = await this.playersService.getAllPlayers();

    const playersFilter = players.filter((player) => player._id == _id);

    if (playersFilter.length == 0) {
      throw new BadRequestException(`O id ${_id} não é um jogador!`);
    }

    return await this.challengeModel
      .find()
      .where('players')
      .in(_id)
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async updateChallenge(
    _id: string,
    payload: UpdateChallengeDto,
  ): Promise<void> {
    const challengeFound = await this.challengeModel.findById(_id).exec();

    if (!challengeFound) {
      throw new NotFoundException(`Desafio ${_id} não cadastrado!`);
    }

    if (payload.status) {
      challengeFound.dateTimeResponse = new Date();
    }
    challengeFound.status = payload.status;
    challengeFound.dateTimeChallenge = payload.dateTimeChallenge;

    await this.challengeModel
      .findOneAndUpdate({ _id }, { $set: challengeFound })
      .exec();
  }

  async assignChallengeMatch(
    _id: string,
    payload: AssignDeAssignChallengeMatch,
  ): Promise<void> {
    const challengeFound = await this.challengeModel.findById(_id).exec();

    if (!challengeFound) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado!`);
    }

    const playerFilter = challengeFound.players.filter(
      (player) => player._id == payload.def,
    );

    this.logger.log(`desafioEncontrado: ${challengeFound}`);
    this.logger.log(`jogadorFilter: ${playerFilter}`);

    if (playerFilter.length == 0) {
      throw new BadRequestException(
        `O jogador vencedor não faz parte do desafio!`,
      );
    }

    const matchCreated = new this.matchModel(payload);

    matchCreated.categories = challengeFound.category;

    matchCreated.players = challengeFound.players;

    const result = await matchCreated.save();

    challengeFound.status = ChallengeStatus.PENDING;

    challengeFound.match = result._id;

    try {
      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: challengeFound })
        .exec();
    } catch (error) {
      await this.matchModel.deleteOne({ _id: result._id }).exec();
      throw new InternalServerErrorException();
    }
  }

  async deleteChallenge(_id: string): Promise<void> {
    const challengeFound = await this.challengeModel.findById(_id).exec();

    if (!challengeFound) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado!`);
    }

    challengeFound.status = ChallengeStatus.CANCELLED;

    await this.matchModel
      .findOneAndUpdate({ _id }, { $set: challengeFound })
      .exec();
  }
}
