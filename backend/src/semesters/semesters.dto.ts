import { IsDateString, IsString, MinLength } from 'class-validator';

export class SemesterDto {
  @IsString() @MinLength(1) name!: string;
  @IsString() @MinLength(1) year!: string;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
}
