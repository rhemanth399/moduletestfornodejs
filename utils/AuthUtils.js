const validator = require("validator");

/**
 * @function - cleaning the data for registration
 * @param {email : String, username, name, password: Boolean}
 * @returns  - return a promise either resolve or reject with errors
 */
const cleanupAndValidate = ({ email, username, name, password }) => {
  return new Promise((resolve, reject) => {
    if (!email || !username || !name || !password) {
      reject("Missing Credentials");
    }

    if (typeof email !== "string") reject("Invalid Email");
    if (typeof username !== "string") reject("Invalid Username");
    if (typeof password !== "string") reject("Invalid Password");

    if (username.length <= 2 || username.length > 50) {
      reject("username should be 3-50 charachters");
    }
    if (password.length <= 2 || username.password > 50) {
      reject("password should be 3-20 charachters");
    }

    if (!validator.isEmail(email)) {
      reject("Invalid Email Format");
    }

    resolve();
  });
};

module.exports = { cleanupAndValidate };