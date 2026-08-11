import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import {
  ClienteInvalidoError,
  OrcamentoInvalidoError,
  ProdutoInvalidoError,
  VendaDomainError,
  VendaNaoEncontradaError,
} from '../domain/venda.errors';

const NOT_FOUND_ERRORS = [
  VendaNaoEncontradaError,
  ClienteInvalidoError,
  ProdutoInvalidoError,
  OrcamentoInvalidoError,
];

@Catch(VendaDomainError)
export class VendaDomainErrorFilter implements ExceptionFilter {
  catch(exception: VendaDomainError, host: ArgumentsHost): void {
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
