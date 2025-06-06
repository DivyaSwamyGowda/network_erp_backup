// common/filters/all-exceptions.filter.ts
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly versionInfo = {
      appVersion: '1.0.0',
      apiVersion: 'v1',
    };
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
  
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const errorResponse = {
        statusCode: status,
        status: 'error',
        timestamp: new Date().toISOString(),
        version: {
          ...this.versionInfo,
        },
        data: null,
        error: {
          code: status,
          message:
            exception instanceof HttpException
              ? (exception.getResponse() as any)?.message || exception.message
              : 'Internal server error',
        },
      };
  
      response.status(status).json(errorResponse);
    }
  }