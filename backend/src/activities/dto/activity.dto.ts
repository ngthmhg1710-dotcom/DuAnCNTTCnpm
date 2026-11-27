import { IsArray, IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

// ~1.5MB ảnh base64; frontend nén ảnh trước khi gửi nên thường chỉ vài trăm KB.
const IMAGE_MAX = 2_000_000;

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateActivityDto {
  @Transform(trim) @IsString() @IsNotEmpty({ message: 'Tên hoạt động không được để trống.' }) title!: string;
  @Transform(trim) @IsString() @IsNotEmpty({ message: 'Loại hoạt động không được để trống.' }) category!: string;
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
  @IsOptional() @IsArray() @IsString({ each: true }) targetClasses?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) targetCohorts?: string[];
  // Tự nhắc sinh viên đã đăng ký trước giờ bắt đầu (giờ). null/bỏ trống = không nhắc.
  @IsOptional() @IsInt() @Min(1) @Max(168) remindBeforeHours?: number | null;
  @IsOptional() @IsBoolean() remindEmail?: boolean;
  @IsOptional() @IsString() @MaxLength(3000) remindMessage?: string;
}

export class UpdateActivityDto {
  @IsOptional() @Transform(trim) @IsString() @IsNotEmpty({ message: 'Tên hoạt động không được để trống.' }) title?: string;
  @IsOptional() @Transform(trim) @IsString() @IsNotEmpty({ message: 'Loại hoạt động không được để trống.' }) category?: string;
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
  @IsOptional() @IsBoolean() closed?: boolean;
  @IsOptional() @IsBoolean() cancelled?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) targetClasses?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) targetCohorts?: string[];
  // Tự nhắc sinh viên đã đăng ký trước giờ bắt đầu (giờ). null/bỏ trống = không nhắc.
  @IsOptional() @IsInt() @Min(1) @Max(168) remindBeforeHours?: number | null;
  @IsOptional() @IsBoolean() remindEmail?: boolean;
  @IsOptional() @IsString() @MaxLength(3000) remindMessage?: string;
}
