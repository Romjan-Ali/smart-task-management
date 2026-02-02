export class AppError extends Error {
  constructor(
    public statusCode: number,
    public override message: string,
    public isOperational = true
  ) {
    super(message)
    this.name = this.constructor.name
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}