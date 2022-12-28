import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { UpdatePlayerDto } from './dtos/update-player.dto';
import { Player } from './interfaces/player.interface';
import { PlayersValidationParametersPipe } from './pipes/players-validation-parameters.pipe';
import { PlayersService } from './players.service';

@Controller('api/v1/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createPlayer(@Body() payload: CreatePlayerDto) {
    try {
      await this.playersService.createUpdatePlayer(payload);
    } catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getAllPlayers(): Promise<Player | Player[]> {
    return this.playersService.getAllPlayers();
  }

  @Get('/:email')
  async getPlayerByEmail(
    @Param('email', PlayersValidationParametersPipe) email: string,
  ): Promise<Player | Player[]> {
    return await this.playersService.getPlayerByEmail(email);
  }

  @Get('/:_id')
  async getPlayerById(
    @Param('_id', PlayersValidationParametersPipe) _id: string,
  ): Promise<Player | Player[]> {
    return await this.playersService.getPlayerById(_id);
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async updateUserByEmail(
    @Param('_id', PlayersValidationParametersPipe) _id: string,
    @Body() payload: UpdatePlayerDto,
  ): Promise<Player> {
    return await this.playersService.updateUser(_id, payload);
  }

  @Delete('/:email')
  async deleteUserByEmail(
    @Param('email', PlayersValidationParametersPipe) email: string,
  ): Promise<void> {
    return this.playersService.deleteUserByEmail(email);
  }
}
