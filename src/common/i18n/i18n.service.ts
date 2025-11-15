import { Injectable } from '@nestjs/common';
import { translations } from './translations';

@Injectable()
export class I18nService {
  translate(key: string, lang: string = 'en'): string {
    const language = lang in translations ? lang : 'en';
    return translations[language][key] || key;
  }

  translateError(errorCode: string, lang: string = 'en'): string {
    return this.translate(errorCode, lang);
  }
}
