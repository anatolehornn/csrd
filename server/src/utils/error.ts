export class AppError extends Error {
  public details?: unknown;
  
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class CSVParseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(500, `CSV Parsing Error: ${message}`, true, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, `Validation Error: ${message}`, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}
