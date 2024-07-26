

// This function takes another function (requestHandler) as an argument
const asyncHandler = (requestHandler) => {
    // Inside, it defines a new function that takes three parameters: req, res, and next
 return (req, res, next) => {
        // It wraps the execution of requestHandler in a Promise.resolve()
        Promise.resolve(requestHandler(req, res, next))
            // If there's an error during execution, it catches it and calls next() with the error
            .catch((err) => next(err));
    }
}

// Here is another version of asyncHandler using async/await syntax
// It takes a function (fn) that can be executed asynchronously
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         // Inside this function, it awaits the execution of fn with req, res, and next
//         await fn(req, res, next);
//     } catch (error) {
//         // If there's an error during execution, it sends a JSON response with an error message
//         // The status code is either taken from error.code or defaults to 500 (Internal Server Error)
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message || "Server Error",
//         });
//     }
// };


// const asyncHandler = (fn) => (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };
  
  export { asyncHandler };
  