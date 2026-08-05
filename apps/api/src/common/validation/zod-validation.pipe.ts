import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

/**
 * Validates `body`/`query`/`param` against a Zod schema at the API
 * boundary (spec Secao 8: "Validacao com Zod compartilhada"). Use per-route
 * via `@UsePipes(new ZodValidationPipe(schema))` - the global `ValidationPipe`
 * in `main.ts` is `class-validator`-based and untouched by this (see
 * ADR-0004).
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'query' && metadata.type !== 'param') {
      return value;
    }

    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Dados inválidos.',
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    return result.data;
  }
}
