import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { Request, Response, NextFunction } from 'express';

const ajv = new Ajv({ allErrors: true, coerceTypes: true, removeAdditional: 'all' });
addFormats(ajv);

export const makeValidator = (schema: object) => {
  const validate: ValidateFunction = ajv.compile(schema);
  return (req: Request, res: Response, next: NextFunction) => {
    const valid = validate(req.body);
    if (valid) return next();
    const errors =
      (validate.errors || []).map(
        (e: {
          instancePath?: string;
          schemaPath?: string;
          message?: string;
          params?: unknown;
        }) => ({
          path: e.instancePath || e.schemaPath,
          message: e.message,
          params: e.params,
        })
      ) || [];
    return res.status(400).json({ success: false, errors });
  };
};
