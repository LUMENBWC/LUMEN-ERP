import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

const schema = z.object({ nome: z.string().min(2) });
const bodyMetadata: ArgumentMetadata = { type: 'body' };
const customMetadata: ArgumentMetadata = { type: 'custom' };

describe('ZodValidationPipe', () => {
  it('retorna o valor parseado quando válido', () => {
    const pipe = new ZodValidationPipe(schema);
    expect(pipe.transform({ nome: 'Ana' }, bodyMetadata)).toEqual({ nome: 'Ana' });
  });

  it('lança BadRequestException com os issues quando inválido', () => {
    const pipe = new ZodValidationPipe(schema);
    try {
      pipe.transform({ nome: 'A' }, bodyMetadata);
      fail('deveria ter lançado');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as { issues: unknown[] };
      expect(response.issues.length).toBeGreaterThan(0);
    }
  });

  it('ignora metadata que não é body/query/param', () => {
    const pipe = new ZodValidationPipe(schema);
    const valorQualquer = { qualquer: 'coisa' };
    expect(pipe.transform(valorQualquer, customMetadata)).toBe(valorQualquer);
  });
});
