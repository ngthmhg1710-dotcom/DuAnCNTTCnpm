import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class SendMessageDto {
  @IsArray() @ArrayMinSize(1, { message: 'Chọn ít nhất 1 hoạt động.' }) @ArrayMaxSize(30, { message: 'Tối đa 30 hoạt động mỗi lần gửi.' }) @IsInt({ each: true }) activityIds!: number[];
  @IsArray() @ArrayMinSize(1, { message: 'Chọn ít nhất 1 sinh viên.' }) @ArrayMaxSize(500, { message: 'Tối đa 500 sinh viên mỗi lần gửi.' }) @IsInt({ each: true }) studentIds!: number[];
  @Transform(trim) @IsString() @IsNotEmpty({ message: 'Tiêu đề không được để trống.' }) @MaxLength(200) subject!: string;
  @Transform(trim) @IsString() @IsNotEmpty({ message: 'Nội dung không được để trống.' }) @MaxLength(5000) body!: string;
  @IsBoolean() app!: boolean; // gửi thông báo trong hệ thống
  @IsBoolean() email!: boolean; // gửi kèm email
}
