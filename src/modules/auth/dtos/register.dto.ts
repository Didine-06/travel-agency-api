import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, IsDateString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email' })
  @IsEmail({}, { message: 'L\'email doit être valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @ApiPropertyOptional({ example: 'John', description: 'Prénom' })
  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Nom' })
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Téléphone' })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St', description: 'Adresse' })
  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères' })
  address?: string;

  @ApiPropertyOptional({ example: 'New York', description: 'Ville' })
  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères' })
  city?: string;

  @ApiPropertyOptional({ example: 'USA', description: 'Pays' })
  @IsOptional()
  @IsString({ message: 'Le pays doit être une chaîne de caractères' })
  country?: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Date de naissance' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de naissance doit être une date valide (format: YYYY-MM-DD)' })
  dateOfBirth?: Date;
}
