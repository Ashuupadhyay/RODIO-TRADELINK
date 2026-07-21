const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  6
);

module.exports = () => nanoid();