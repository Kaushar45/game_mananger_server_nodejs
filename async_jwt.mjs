import jwt from "jsonwebtoken";
const asyncJwtSign = (payload, secret, options) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, payload) => {
      if (err) {
        return reject(err);
      }
      resolve(payload);
    });
  });
};

const asyncJwtVerify = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, token) => {
      if (err) {
        return reject(err);
      }
      resolve(token);
    });
  });
};

export { asyncJwtSign, asyncJwtVerify };
