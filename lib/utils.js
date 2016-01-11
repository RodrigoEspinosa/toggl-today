'use strict';

const DEBUG = false;
const ARGS_REGEX = /--([:\-_a-z0-9]+)=([:+\-_\.a-z0-9]+)/i;

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

module.exports.parseArgs = (args) => {
  const parsedArgs = {};

  for (let argument of args) {
    let parsed = argument.match(ARGS_REGEX);

    if (parsed && parsed.length > 2) {
      parsedArgs[parsed[1]] = parsed[2];
    }
  }

  return parsedArgs;
};
