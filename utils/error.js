export const errorHandler = (status, message) => {
  const err = new Error(message);
  err.statusCode = status;
  return err;
};
