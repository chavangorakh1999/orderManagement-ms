const errorHandler = (err, req, res, _next) => {
  if (err.status) {
    // Expected business error (4xx) — not a server fault, no need to error-log
    return res.status(err.status).json({
      error: {
        code: err.code || 'ERROR',
        message: err.message,
        details: err.details || [],
      },
    });
  }

  // Unexpected server error (5xx) — log for investigation
  console.error('[Server Error]', err.message, err.stack);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: [],
    },
  });
};

module.exports = { errorHandler };
