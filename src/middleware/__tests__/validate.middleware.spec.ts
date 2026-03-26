import { Request, Response } from 'express';
import { makeValidator } from '../validate.middleware';

describe('makeValidator middleware', () => {
  const schema = {
    type: 'object',
    properties: {
      bookId: { type: 'string', minLength: 1 },
      type: { type: 'string', enum: ['epub', 'pdf'] },
    },
    required: ['bookId', 'type'],
    additionalProperties: false,
  } as const;

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('calls next when the payload is valid', () => {
    req.body = { bookId: 'book-1', type: 'epub' };

    const middleware = makeValidator(schema);
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 when the payload is invalid', () => {
    req.body = { bookId: '', type: 'txt' };

    const middleware = makeValidator(schema);
    middleware(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.any(Array),
      })
    );
  });
});
