import { IsInt, Max, Min } from 'class-validator';

export class AlertConfigDto {
  @IsInt() @Min(1) @Max(50) lowBelow!: number;
  @IsInt() @Min(1) @Max(50) mediumBelow!: number;
  @IsInt() @Min(0) @Max(100) targetPoints!: number;
  @IsInt() @Min(1) @Max(100) manyPending!: number;
  @IsInt() @Min(0) @Max(100) riskAfterPct!: number;
}
