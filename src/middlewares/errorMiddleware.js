// const errorHandler = (err, req, res, next) => {
//     console.error(err.stack);
    
//     let statusCode = err.statusCode || 500;
//     let message = err.message || "Internal Server Error";

//     if(err.name === "validationError") {
//         statusCode = 400;
//         message = "Validation Error: " + Object.values(err.errors).map(val => val.message).join(", ");
//     }
// }