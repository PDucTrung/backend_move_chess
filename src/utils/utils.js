const validator = require('validator');

module.exports.validatePassword = (password) => {
  const minLength = 6;
  const maxLength = 50;
  const hasNumber = /\d/;
  const hasUpperCase = /[A-Z]/;
  const hasLowerCase = /[a-z]/;
  const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/;

  if (
    !validator.isLength(password, { min: minLength, max: maxLength }) ||
    !hasNumber.test(password) ||
    !hasUpperCase.test(password) ||
    !hasLowerCase.test(password) ||
    !hasSpecialCharacter.test(password)
  ) {
    return false;
  }

  return true;
};