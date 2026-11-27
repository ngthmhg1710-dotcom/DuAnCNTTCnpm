import { IsDateString, IsIn, IsString, Matches } from 'class-validator';

export const SEMESTER_NAMES = ['HK1', 'HK2', 'HK Hè'];

export class SemesterDto {
  @IsIn(SEMESTER_NAMES, { message: 'Học kỳ phải là HK1, HK2 hoặc HK Hè.' }) name!: string;
  @IsString() @Matches(/^\d{4}-\d{4}$/, { message: 'Năm học phải có dạng 2026-2027.' }) year!: string;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
}
