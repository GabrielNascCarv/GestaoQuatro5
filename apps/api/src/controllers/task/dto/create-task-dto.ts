import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'A pontuação (score) é obrigatória.' })
  @IsNumber()
  @Min(0, { message: 'A pontuação não pode ser negativa.' })
  score!: number;

  @IsNotEmpty({ message: 'O ID do criador é obrigatório.' })
  @IsString()
  created_by_id!: string;
}
