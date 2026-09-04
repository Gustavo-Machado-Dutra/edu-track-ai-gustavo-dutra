import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum Platform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}

export class RegisterPushDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(Platform)
  platform: Platform;
}
