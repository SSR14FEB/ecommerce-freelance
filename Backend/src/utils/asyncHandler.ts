import { RequestHandler, Request, Response, NextFunction } from "express";

const asyncHandler =
  (fun: RequestHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fun(req, res, next);
    } catch (error: any) {
      const statuscode: number = error.statusCode || 500;
      res.status(statuscode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  };

  export {asyncHandler}
