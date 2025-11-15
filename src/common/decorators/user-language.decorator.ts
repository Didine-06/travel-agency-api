import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserLanguage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.userLanguage || 'en';
  },
);
