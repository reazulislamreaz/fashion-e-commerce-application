import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RoleCode, UserStatus } from '@prisma/client';

export class UserQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }: { value: unknown }) =>
    value !== undefined ? parseInt(String(value), 10) : 1,
  )
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @Transform(({ value }: { value: unknown }) =>
    value !== undefined ? parseInt(String(value), 10) : 10,
  )
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Search name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: RoleCode })
  @IsOptional()
  @IsEnum(RoleCode)
  role?: RoleCode;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
