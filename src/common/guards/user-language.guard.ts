import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UserLanguageGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Si l'utilisateur est authentifié, récupérer sa langue depuis la BDD
    if (request.user?.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: request.user.userId },
        select: { languageId: true },
      });

      // Attacher la langue à la requête
      request.userLanguage = user?.languageId || 'en';
    } else {
      // Par défaut, anglais
      request.userLanguage = 'en';
    }

    return true;
  }
}
