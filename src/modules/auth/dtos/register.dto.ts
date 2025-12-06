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

  @ApiPropertyOptional({ example: '+1234567890', description: 'Téléphone' })
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St', description: 'Adresse' })
  address?: string;

  @ApiPropertyOptional({ example: 'New York', description: 'Ville' })
  city?: string;

  @ApiPropertyOptional({ example: 'USA', description: 'Pays' })
  country?: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Date de naissance' })
  dateOfBirth?: Date;
}
