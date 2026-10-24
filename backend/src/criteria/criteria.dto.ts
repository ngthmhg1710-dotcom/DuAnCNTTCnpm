import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CriteriaDto {
  @IsInt() semesterId!: number;
  @IsString() @MinLength(1) group!: string;
  @IsString() @MinLength(1) name!: string;
  @IsOptional() @IsString() description?: string;
  @IsInt() @Min(1) requirement!: number;
}
