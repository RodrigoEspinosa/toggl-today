'use strict';

const DEBUG = false;
const ARGS_REGEX = /--([:\-_a-z0-9]+)=([:+\-_\.a-z0-9]+)/i;

export function debug() {
  if (DEBUG) {
    console.log(arguments);
  }
};

export function cleanDescription(str='No description.') {
  // Trim the string.
  str = str.trim();

  // Ensure there is a final dot.
  if (!str.endsWith('.')) {
    str += '.';
  };

  return str;
};

export function parseArgs(args) {
  const parsedArgs = {};

  for (let argument of args) {
    let parsed = argument.match(ARGS_REGEX);

    if (parsed && parsed.length > 2) {
      parsedArgs[parsed[1]] = parsed[2];
    }
  }

  return parsedArgs;
};

export default {debug, cleanDescription, parseArgs};
