//Async handler utility function

// ! Method #2
const async_handler = (func) => {
  return (req, res, next) => {
    //* Promise.resolve is used to ensure that the result of func(req, res, next) is treated as a promise.
    Promise.resolve(func(req, res, next))
      .then((result) => {
        // Process result if needed
      })
      .catch((error) => callback(error));
  };
};

export { async_handler };

// here the working
/*Client Request:
  - POST /api/v1/users/register
  - Arguments: req, res, next

Route Matching:
  - Calls register_user
  - Arguments: req, res, next

async_handler Call:
  - Calls async_handler with register_user
  - Arguments: func (register_user)

Middleware Execution:
  - Returns and executes middleware function (req, res, next) => { ... }
  - Arguments: req, res, next

Inside Middleware:
  - Calls Promise.resolve(func(req, res, next))
  - Arguments: req, res, next

register_user Execution:
  - Async function register_user is called
  - Arguments: req, res, next

  Extract Data:
    - const { Full_name, Email } = req.body;
    - Arguments: req.body
    - Data: Full_name, Email

  Validation:
    - if (!Full_name || !Email) { throw new API_Error_handler(400, "All fields are required"); }
    - Condition: If Full_name or Email is empty
    - Action: Throws API_Error_handler if validation fails

  Further Logic:
    - Additional logic to register the user...
    - (Assumed) Database operations, etc.

  Response:
    - res.status(201).json({ message: "User registered successfully" });
    - Action: Sends a success response

Promise Handling:
  - If resolved, no action
  - If rejected, .catch((error) => next(error))
  - Arguments: error

Error Handling Middleware:
  - Handles errors passed by next(error)
  - Arguments: err, req, res, next
 */

// ----------------------------------------------------------------------------------

// ! Method #1
// * const handler = (function_)=>{()=>{}}
const handler_method_1_v1 = (function_) => async (req, res, next) => {
  try {
    await function_(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// we can also write it like this
const handler_method_1_v2 = (function_) => {
  //!handler returns a new function. this new function takes 2 arguments (...args).
  return async (req, res, next) => {
    try {
      await function_(req, res, next);
    } catch (error) {
      res.status(error.code || 500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

/*
 important handler_method_1 Explanation 

todo-> *The handler function wraps an asynchronous function (function_) with error handling logic.                                                                  *It returns an asynchronous function (middleware) that can be used in an Express application.                                                                               *The returned function waits for function_ to complete and handles any errors that occur during its execution.

!--------------------------------------------------------------------------------------------------------------------

 *handler function to wrap your middleware or route handlers provides several benefits
 *Centralized Error Handling
 * Cleaner and More Readable Code
 * Reusability
 

! // here is the simple example of wrapping function 
! //  Define the handler function
const handler = (function_) => {

 !  // handler returns a new function. this new function takes any number of arguments (...args). 
    return (arg1, arg2) => {
      try {
 !  //  Call the original function with the provided arguments
        function_(arg1, arg2);

      } catch (error) {

     ! //    Handle any errors thrown by the original function
        console.error(`Error: ${error.message}`);
      }
    };
  };
  
 ! //  Simple synchronous function
  const someFunction = (a, b) => {
    if (a < 0) {
      throw new Error("a must be non-negative!");
    }
    console.log(`The sum of ${a} and ${b} is ${a + b}`);
  };
  
   ! //Use the handler to wrap the simple function
  const wrappedFunction = handler(someFunction);
  
  ! //  Call the wrapped function with various inputs
  wrappedFunction(2, 3);  // Expected output: "The sum of 2 and 3 is 5"
  wrappedFunction(-1, 3); // Expected output: "Error: a must be non-negative!"
  

  */
