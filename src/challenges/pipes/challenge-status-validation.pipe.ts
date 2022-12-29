import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ChallengeStatus } from '../interfaces/challenges-status.enum';

export class ChallengeStatusValidationPipe implements PipeTransform {
  readonly statusAllowed = [
    ChallengeStatus.ACCEPT,
    ChallengeStatus.NEGATED,
    ChallengeStatus.CANCELLED,
  ];

  transform(value: any) {
    const status = value.status.toUpperCase();

    if (!this.statusValid(status)) {
      throw new BadRequestException(`${status} é um status inválido`);
    }

    return value;
  }

  private statusValid(status: any) {
    const idx = this.statusAllowed.indexOf(status);
    return idx !== -1;
  }
}
