import { IsOptional } from 'class-validator';
import { ChallengeStatus } from '../interfaces/challenges-status.enum';

export class UpdateChallengeDto {
  @IsOptional()
  dateTimeChallenge: Date;

  @IsOptional()
  status: ChallengeStatus;
}
