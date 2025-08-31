import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RequestHandler } from "express";

export function validateDto(dtoClass: any): RequestHandler {
  return async (req, res, next) => {
    const dtoObj = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoObj, { whitelist: true });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
    }

    req.body = dtoObj; // assign transformed DTO
    next();
  };
}
