import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

interface ErrorResponseBody {
  code: string;
  message: string;
  details: unknown;
  traceId: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = randomUUID();

    const { status, body } = this.resolve(exception, traceId);

    this.logger.error(
      `[${traceId}] ${request.method} ${request.url} -> ${status}: ${body.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(body);
  }

  private resolve(
    exception: unknown,
    traceId: string,
  ): { status: number; body: ErrorResponseBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const isObject = typeof exceptionResponse === 'object' && exceptionResponse !== null;

      return {
        status,
        body: {
          code: HttpStatus[status] ?? 'ERROR',
          message: isObject
            ? ((exceptionResponse as Record<string, unknown>).message as string) ??
              exception.message
            : exception.message,
          details: isObject ? exceptionResponse : null,
          traceId,
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno inesperado.',
        details: null,
        traceId,
      },
    };
  }
}
