// common/interceptors/api-response.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  @Injectable()
  export class ApiResponseInterceptor implements NestInterceptor {
    private readonly versionInfo = {
      appVersion: '1.0.0',
      apiVersion: 'v1',
    };
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const httpContext = context.switchToHttp();
      const response = httpContext.getResponse();
  
      return next.handle().pipe(
        map((data) => ({
          statusCode: response.statusCode,
          status: 'success',
          timestamp: new Date().toISOString(),
          version: {
            ...this.versionInfo,
          },
          data: data ?? null,
          error: null,
        })),
      );
    }
  }