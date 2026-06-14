import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'A pontuação não pode ser negativa.' })
  score?: number;

  @IsOptional()
  @IsString()
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'], {
    message: 'Status inválido. Deve ser TODO, IN_PROGRESS, IN_REVIEW ou COMPLETED.',
  })
  status?: any;

  @IsOptional()
  @IsString()
  assigned_to_id?: string | null;

  @IsOptional()
  @IsString()
  due_date?: string | null;
}
