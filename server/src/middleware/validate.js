const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details,
        },
      });
    }
    next(err);
  }
};

module.exports = { validate };
