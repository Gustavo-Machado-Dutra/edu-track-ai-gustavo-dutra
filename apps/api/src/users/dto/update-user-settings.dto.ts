import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;
}
