import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// ~1.5MB ảnh base64; frontend nén ảnh trước khi gửi nên thường chỉ vài trăm KB.
const IMAGE_MAX = 2_000_000;

export class CreateActivityDto {
  @IsString() title!: string;
  @IsString() category!: string;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() @MaxLength(IMAGE_MAX) imageUrl?: string;
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
  @IsOptional() @IsString() @MaxLength(IMAGE_MAX) imageUrl?: string; // '' = xóa ảnh
  @IsOptional() @IsDateString() startAt?: string;
  @IsOptional() @IsDateString() endAt?: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsString() ruleCode?: string;
  @IsOptional() @IsInt() @Min(0) @Max(20) points?: number;
}
