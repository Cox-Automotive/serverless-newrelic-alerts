module.exports.endpoint = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello, test executed. The time is ${new Date().toTimeString()}.`,
    }),
  };

  callback(null, response);
};
