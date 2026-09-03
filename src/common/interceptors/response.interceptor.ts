import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((result) => {
        let message = 'Operasi berhasil';
        let data = result;

        if (
          result &&
          typeof result === 'object' &&
          'message' in result &&
          'data' in result
        ) {
          message = result.message;
          data = result.data;
        } else if (
          result &&
          typeof result === 'object' &&
          'message' in result &&
          Object.keys(result).length === 1
        ) {
          message = result.message;
          data = null as any;
        }

        return {
          statusCode,
          success: true,
          message,
          data,
        };
      }),
    );
  }
}
