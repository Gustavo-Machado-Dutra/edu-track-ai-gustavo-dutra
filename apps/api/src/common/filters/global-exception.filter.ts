import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

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

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erro interno do servidor';

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception instanceof Error ? exception.message : String(exception), exception instanceof Error ? exception.stack : '');
    }

    const body =
      typeof message === 'string'
        ? { statusCode: status, message }
        : message;

    response.status(status).send({
      error: body,
    });
  }
}
