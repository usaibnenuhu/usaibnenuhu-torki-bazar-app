// Domain errors carry a friendly `message` safe to show directly in the UI.
// Never surface raw stack traces or driver error text to end users.
export class AppError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message);
  }
}

export class DuplicateError extends AppError {
  constructor(message: string) {
    super("DUPLICATE_ERROR", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super("NOT_FOUND", message);
  }
}

export class InsufficientStockError extends AppError {
  constructor(message: string) {
    super("INSUFFICIENT_STOCK", message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super("UNAUTHORIZED", message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Invalid username or password.") {
    super("AUTHENTICATION_ERROR", message);
  }
}
