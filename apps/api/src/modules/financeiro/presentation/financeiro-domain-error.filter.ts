import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import {
  CategoriaDespesaNaoEncontradaError,
  ContaPagarNaoEncontradaError,
  ContaReceberNaoEncontradaError,
  FinanceiroDomainError,
  FornecedorInvalidoError,
} from '../domain/financeiro.errors';

const NOT_FOUND_ERRORS = [
  ContaReceberNaoEncontradaError,
  ContaPagarNaoEncontradaError,
  CategoriaDespesaNaoEncontradaError,
  FornecedorInvalidoError,
];

@Catch(FinanceiroDomainError)
export class FinanceiroDomainErrorFilter implements ExceptionFilter {
  catch(exception: FinanceiroDomainError, host: ArgumentsHost): void {
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
