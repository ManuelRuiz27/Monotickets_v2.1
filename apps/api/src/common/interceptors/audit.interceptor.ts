import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { id?: string; sub?: string } | undefined;
    const userId = user?.id ?? user?.sub ?? null;
    const method = req.method;
    const path = req.originalUrl || req.url;

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const auditLog = {
          level: 'audit',
          method,
          path,
          userId,
          duration
        };
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(auditLog));
      })
    );
  }
}
