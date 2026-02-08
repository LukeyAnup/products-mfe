import { AppError, ResponseHandler } from "./appError";

type GenericReponse = {
  status: boolean;
  statusCode: number;
  message: string;
};

export type Response<T> = GenericReponse & {
  data?: T;
};
export type ErrorReponse = GenericReponse & {};

export type IHandlerReponse<T> = Omit<Response<T>, "status">;

export const responseHandler = async <T>(
  handler: () => Promise<IHandlerReponse<T>>,
): Promise<Response<T> | ErrorReponse> => {
  try {
    const result = await handler();
    return new ResponseHandler(
      result.data,
      result.statusCode,
      result.message,
    ).send();
  } catch (error) {
    if (error instanceof AppError) {
      return new ResponseHandler([], 400, error.message).sendError();
    }
    return new ResponseHandler([], 500, "Something went wrong").sendError();
  }
};
