import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @IsNotEmpty({ message: 'O refresh token é obrigatório.' })
  @IsString()
  refreshToken!: string;
}
