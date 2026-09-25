import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { LlmProviderError } from '../../ai/provider/llm-provider-error';

type FastifyResponse = {
  status: (statusCode: number) => FastifyResponse;
  send: (payload: unknown) => void;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyResponse>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: Record<string, unknown> = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      body = typeof res === 'string' ? { statusCode: status, message: res } : (res as Record<string, unknown>);
    } else if (exception instanceof LlmProviderError) {
      const rawMessage = exception.message.toLowerCase();
      if (
        exception.status === 429 ||
        exception.code === 'quota-exceeded' ||
        rawMessage.includes('quota') ||
        rawMessage.includes('rate limit')
      ) {
        status = HttpStatus.TOO_MANY_REQUESTS;
        body = {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          code: 'PROVIDER_QUOTA',
          message: 'O limite de uso do provedor de IA foi temporariamente atingido.',
        };
      } else if (exception.status === 503 || exception.status === 502) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        body = {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          code: 'PROVIDER_UNAVAILABLE',
          message: 'O provedor de inteligência artificial está temporariamente indisponível.',
        };
      } else if (exception.status === 401 || exception.status === 403) {
        status = HttpStatus.BAD_GATEWAY;
        body = {
          statusCode: HttpStatus.BAD_GATEWAY,
          code: 'PROVIDER_AUTH_ERROR',
          message: 'Erro de autenticação com o provedor de IA.',
        };
      } else {
        status = HttpStatus.BAD_GATEWAY;
        body = {
          statusCode: HttpStatus.BAD_GATEWAY,
          code: 'PROVIDER_ERROR',
          message: 'Erro na comunicação com o provedor de IA.',
        };
      }

      this.logger.error(
        `[GlobalExceptionFilter] LlmProviderError mapped to status ${status}: ${exception.message}`,
      );
    } else {
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
        exception instanceof Error ? exception.stack : '',
      );
    }

    response.status(status).send({
      error: body,
    });
  }
}
