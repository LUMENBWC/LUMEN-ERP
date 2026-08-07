import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { CaixaDomainError } from '../domain/caixa.errors';

@Catch(CaixaDomainError)
export class CaixaDomainErrorFilter implements ExceptionFilter {
  catch(exception: CaixaDomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(HttpStatus.CONFLICT).json({
      code: HttpStatus[HttpStatus.CONFLICT],
      message: exception.message,
      details: null,
      traceId: randomUUID(),
    });
  }
}
