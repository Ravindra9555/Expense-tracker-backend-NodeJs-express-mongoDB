// Define a class named ApiResponse
class ApiResponse {
    // Constructor method to initialize the object
    constructor(statusCode, message = "Success", data) {
      // Set up the initial properties of the object
      this.statusCode = statusCode;  // Store the HTTP status code
      this.message = message;        // Store a message (default is "Success")
      this.data = data;              // Store any additional data related to the response
      this.success = statusCode < 400;  // Determine if the response is successful based on the status code
    }
  }
  