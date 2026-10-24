import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString() @MinLength(1) title!: string;
  @IsString() @MinLength(1) message!: string;
  // bỏ trống cả hai = gửi tất cả sinh viên
  @IsOptional() @IsString() className?: string;
  @IsOptional() @IsString() cohort?: string;
}
