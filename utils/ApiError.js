// Define a new class named ApiError that extends the built-in Error class
class ApiError extends Error {
  
  // Constructor method to initialize the object
  constructor(
    statusCode,           // Parameter: HTTP status code for the error
    message = "Something wents wrongs",  // Parameter: Error message (default value provided)
    errors = [],          // Parameter: Array to store additional errors or details
    stack = ""            // Parameter: Stack trace for debugging (default empty string)
  ) {
    // Call the constructor of the Error class with the provided message
    super(message);

    // Initialize properties specific to ApiError
    this.statusCode = statusCode;  // Store the HTTP status code in the object
    this.data = null;              // Initialize a property for additional data (set to null)
    this.message = message;        // Store the error message
    this.success = false;          // Indicates that the operation was not successful
    this.errors = errors;          // Store any additional errors or details

    // Check if a stack trace was provided; if not, capture the stack trace
    if (stack) {
      this.stack = stack;          // Store the provided stack trace
    } else {
      Error.captureStackTrace(this, this.constructor);  // Capture stack trace from constructor
    }
  }
}

// Export the ApiError class to make it available for other parts of the code
export { ApiError };
