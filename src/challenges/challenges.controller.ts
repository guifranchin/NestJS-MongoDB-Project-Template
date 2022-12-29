import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { AssignDeAssignChallengeMatch } from './dtos/assign-game-challenge.dto';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { Challenge } from './interfaces/challenges.interface';
import { ChallengeStatusValidationPipe } from './pipes/challenge-status-validation.pipe';

@Controller('api/v1/challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  private readonly logger = new Logger(ChallengesService.name);

  @Post()
  @UsePipes(ValidationPipe)
  async createChallenge(
    @Body() payload: CreateChallengeDto,
  ): Promise<Challenge> {
    this.logger.log(`create Challenge Dto: ${JSON.stringify(payload)}`);
    return await this.challengesService.createChallenge(payload);
  }

  @Get()
  async consultChallenges(
    @Query('idPlayer') _id: string,
  ): Promise<Array<Challenge>> {
    return _id
      ? await this.challengesService.consultChallengesOfOnePlayer(_id)
      : await this.challengesService.consultAllChallenges();
  }

  @Put('/:chellange')
  async updateChallenge(
    @Body(ChallengeStatusValidationPipe) payload: UpdateChallengeDto,
    @Param('chellange') _id: string,
  ): Promise<void> {
    await this.challengesService.updateChallenge(_id, payload);
  }

  @Post('/:challenge/match/')
  async assignChallengeMatch(
    @Body(ValidationPipe) payload: AssignDeAssignChallengeMatch,
    @Param('challenge') _id: string,
  ): Promise<void> {
    return await this.challengesService.assignChallengeMatch(_id, payload);
  }

  @Delete('/:_id')
  async deleteChallenge(@Param('_id') _id: string): Promise<void> {
    await this.challengesService.deleteChallenge(_id);
  }
}
