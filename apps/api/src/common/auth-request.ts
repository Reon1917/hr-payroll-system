import type { Request } from 'express';
import type { RequestActor } from '../types/auth';

export interface AuthenticatedRequest extends Request {
  actor?: RequestActor;
}
