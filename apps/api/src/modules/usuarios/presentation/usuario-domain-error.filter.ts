import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import {
  NaoPodeDesativarASiMesmoError,
  PapelNaoEncontradoError,
  UsuarioDomainError,
  UsuarioNaoEncontradoError,
} from '../domain/usuario.errors';

const NOT_FOUND_ERRORS = [UsuarioNaoEncontradoError, PapelNaoEncontradoError];

/** Traduz erros de regra de negocio do modulo Usuarios para o envelope de erro padrao (mesmo formato do AllExceptionsFilter global). */
@Catch(UsuarioDomainError)
export class UsuarioDomainErrorFilter implements ExceptionFilter {
  catch(exception: UsuarioDomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const isNotFound = NOT_FOUND_ERRORS.some((ErrorClass) => exception instanceof ErrorClass);
    const status =
      exception instanceof NaoPodeDesativarASiMesmoError
        ? HttpStatus.FORBIDDEN
        : isNotFound
          ? HttpStatus.NOT_FOUND
          : HttpStatus.CONFLICT;

    response.status(status).json({
      code: HttpStatus[status],
      message: exception.message,
      details: null,
      traceId: randomUUID(),
    });
  }
}
