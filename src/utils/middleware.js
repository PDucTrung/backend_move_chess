const applyMiddleware = (middleware, resolver) => {
  return async (parent, args, context, info) => {
    await new Promise((resolve, reject) => {
      middleware(context.req, context.res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    return resolver(parent, args, context, info);
  };
};

module.exports = { applyMiddleware };
