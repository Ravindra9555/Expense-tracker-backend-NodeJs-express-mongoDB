const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const errors = err.errors || [];
  
    res.status(statusCode).json({
      status: 'error',
      statusCode,
      message,
      errors,
    });
  };
  
  export default errorHandler;
  