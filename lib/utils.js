const DEBUG = false;

module.exports.debug = () => {
  if (DEBUG) {
    console.log(arguments);
  }
};

module.exports.cleanDescription = (str) => {
  // Trim the string.
  str = str.trim();

  // Ensure there is a final dot.
  if (!str.endsWith('.')) {
    str += '.';
  };

  return str;
};
