import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateActivityDto {
  @IsString() title!: string;
  @IsString() category!: string;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() description?: string;
  @IsDateString() startAt!: string;
  @IsOptional() @IsDateString() endAt?: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsString() ruleCode?: string;
  // Quy chế: mỗi mục lớn tối đa 20 điểm nên 1 hoạt động không quá 20.
  @IsOptional() @IsInt() @Min(0) @Max(20) points?: number;
}

export class UpdateActivityDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() startAt?: string;
  @IsOptional() @IsDateString() endAt?: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsString() ruleCode?: string;
  @IsOptional() @IsInt() @Min(0) @Max(20) points?: number;
}
