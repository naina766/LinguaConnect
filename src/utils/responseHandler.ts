import { Response } from 'express';
export const sendResponse = (res: Response, statusCode: number, message: string, data?: any) => {
  res.status(statusCode).json({ success: statusCode < 400, message, data: data || null });
};

export const success = (message: string, data?: any) => ({ status: 'success', message, data });
export const failure = (message: string, error?: any) => ({ status: 'error', message, error: error?.message || error });
