import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateStudySessionDto {
  @IsUUID()
  subjectId: string;

  @IsUUID()
  @IsOptional()
  taskId?: string;

  @IsDateString()
  startedAt: string;

  @IsDateString()
  @IsOptional()
  endedAt?: string | null;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationSeconds?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
