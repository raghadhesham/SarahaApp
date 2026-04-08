import Router from 'express'
import { refreshToken } from './auth.services.js';
export const authRouter = Router();

authRouter.get('/refreshToken',refreshToken)