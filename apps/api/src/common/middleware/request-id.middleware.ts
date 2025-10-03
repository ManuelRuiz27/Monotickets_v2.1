import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] ?? uuid();
    req.headers['x-request-id'] = String(requestId);
    res.setHeader('x-request-id', String(requestId));
    next();
  }
}
