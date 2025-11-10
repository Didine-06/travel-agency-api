import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email de l\'utilisateur' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe' })
  password: string;
}
