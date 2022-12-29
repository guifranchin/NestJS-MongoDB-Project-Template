import { IsNotEmpty } from 'class-validator';
import { Player } from 'src/players/interfaces/player.interface';
import { Result } from '../interfaces/challenges.interface';

export class AssignDeAssignChallengeMatch {
  @IsNotEmpty()
  def: Player;

  @IsNotEmpty()
  resultado: Array<Result>;
}
