import type { ErrorReponse, Response } from "./responseHandler";

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class ResponseHandler<T> {
  protected data: T;
  protected statusCode: number;
  protected message: string;
  constructor(data: T, statusCode: number, message: string) {
    this.data = data;
    this.statusCode = statusCode;
    this.message = message;
  }

  public setStatusCode(statusCode: number) {
    return (this.statusCode = statusCode);
  }

  public getStatusCode() {
    return this.statusCode;
  }

  public setMessage(message: string) {
    return (this.message = message);
  }

  public getMessage() {
    return this.message;
  }

  public setData(data: T) {
    return (this.data = data);
  }

  public getData() {
    return this.data;
  }

  public send(): Response<T> {
    return {
      status: true,
      data: this.getData(),
      statusCode: this.getStatusCode(),
      message: this.getMessage(),
    };
  }
  public sendError(): ErrorReponse {
    return {
      status: false,
      statusCode: this.getStatusCode(),
      message: this.getMessage(),
    };
  }
}
