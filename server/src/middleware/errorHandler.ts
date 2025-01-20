import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error';
import { ZodError } from 'zod';
import { config } from '../config/env';

interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  stack?: string;
  details?: unknown;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error response
  const response: ErrorResponse = {
    status: 'error',
    message: 'Internal server error'
  };

  // Handle known error types
  if (err instanceof AppError) {
    response.message = err.message;
    response.code = err.statusCode.toString();
    
    if (err.isOperational) {
      response.details = err.details;
    }
    
    res.status(err.statusCode);
  } 
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    response.message = 'Validation error';
    response.details = err.errors;
    res.status(400);
  } 
  // Handle other known errors
  else if (err instanceof URIError) {
    response.message = 'Invalid URL';
    res.status(400);
  } 
  else if (err instanceof SyntaxError) {
    response.message = 'Invalid request syntax';
    res.status(400);
  } 
  else {
    // Unknown errors
    res.status(500);
  }

  // Add stack trace in development
  if (config.ENV === 'development') {
    response.stack = err.stack;
  }

  // Log error
  console.error({
    error: err,
    requestId: req.headers['x-request-id'],
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.json(response);
};

// Optional: Add a handler for unhandled rejections and exceptions
process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason);
  // Optionally exit the process
  // process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Optionally exit the process
  // process.exit(1);
});