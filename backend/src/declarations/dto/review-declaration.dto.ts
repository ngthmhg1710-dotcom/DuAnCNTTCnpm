import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewDeclarationDto {
  @IsIn(['receive', 'approve', 'reject', 'supplement'])
  action!: 'receive' | 'approve' | 'reject' | 'supplement';

  @IsOptional() @IsString() note?: string;
}
