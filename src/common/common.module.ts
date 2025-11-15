import { Module, Global } from '@nestjs/common';
import { I18nService } from './i18n';
import { UserLanguageGuard } from './guards/user-language.guard';
import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [I18nService, UserLanguageGuard],
  exports: [I18nService, UserLanguageGuard],
})
export class CommonModule {}
