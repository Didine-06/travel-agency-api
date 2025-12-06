import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'user@example.com', description: 'Email' })
  email?: string;

  @ApiPropertyOptional({ example: 'John', description: 'Prénom' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Nom' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'en', description: 'Langue préférée (en/fr)' })
  languageId?: string;

  @ApiPropertyOptional({ example: true, description: 'Compte actif' })
  isActive?: boolean;

  // Customer fields (only for CLIENT role)
  @ApiPropertyOptional({ example: '+1234567890', description: 'Téléphone (CLIENT uniquement)' })
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St', description: 'Adresse (CLIENT uniquement)' })
  address?: string;

  @ApiPropertyOptional({ example: 'New York', description: 'Ville (CLIENT uniquement)' })
  city?: string;

  @ApiPropertyOptional({ example: 'USA', description: 'Pays (CLIENT uniquement)' })
  country?: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Date de naissance (CLIENT uniquement)' })
  dateOfBirth?: Date;
}
