module.exports = (res, status, message) => {
  res.status(status);
  return new Error(message);
};
