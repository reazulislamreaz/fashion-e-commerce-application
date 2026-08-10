import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RoleCode } from '@prisma/client';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: RoleCode, example: RoleCode.ADMIN })
  @IsEnum(RoleCode)
  roleCode!: RoleCode;
}
