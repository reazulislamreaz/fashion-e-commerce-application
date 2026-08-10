import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Verification token received via email' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
