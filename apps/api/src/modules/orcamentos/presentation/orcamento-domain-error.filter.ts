import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import {
  ClienteInvalidoError,
  OrcamentoDomainError,
  OrcamentoNaoEncontradoError,
  ProdutoInvalidoError,
} from '../domain/orcamento.errors';

const NOT_FOUND_ERRORS = [OrcamentoNaoEncontradoError, ClienteInvalidoError, ProdutoInvalidoError];

@Catch(OrcamentoDomainError)
export class OrcamentoDomainErrorFilter implements ExceptionFilter {
  catch(exception: OrcamentoDomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const isNotFound = NOT_FOUND_ERRORS.some((ErrorClass) => exception instanceof ErrorClass);
    const status = isNotFound ? HttpStatus.NOT_FOUND : HttpStatus.CONFLICT;

    response.status(status).json({
      code: HttpStatus[status],
      message: exception.message,
      details: null,
      traceId: randomUUID(),
    });
  }
}
