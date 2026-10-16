import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  name!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  category!: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsInt()
  @Min(0)
  minStock!: number;
}
