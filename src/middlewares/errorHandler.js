import logger from "../utils/looger.js";

const errorHandler = (err, req, res, next) => {
    logger.error(`Error getting expenses: ${err}`);
    console.error("Error details:", err); // Log full error detail
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
  