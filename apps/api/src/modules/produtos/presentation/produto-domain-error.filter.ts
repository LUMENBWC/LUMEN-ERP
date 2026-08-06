import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import {
  CategoriaInvalidaError,
  ProdutoDomainError,
  ProdutoNaoEncontradoError,
} from '../domain/produto.errors';

const NOT_FOUND_ERRORS = [ProdutoNaoEncontradoError, CategoriaInvalidaError];

@Catch(ProdutoDomainError)
export class ProdutoDomainErrorFilter implements ExceptionFilter {
  catch(exception: ProdutoDomainError, host: ArgumentsHost): void {
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
