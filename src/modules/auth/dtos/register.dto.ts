import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe' })
  password: string;

  @ApiPropertyOptional({ example: 'John', description: 'Prénom' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Nom' })
  lastName?: string;
}
