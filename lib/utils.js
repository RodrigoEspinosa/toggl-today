'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debug = debug;
exports.cleanDescription = cleanDescription;
exports.parseArgs = parseArgs;
var DEBUG = false;
var ARGS_REGEX = /--([:\-_a-z0-9]+)=([:+\-_\.a-z0-9]+)/i;

function debug() {
  if (DEBUG) {
    console.log(arguments);
  }
};

function cleanDescription() {
  var str = arguments.length <= 0 || arguments[0] === undefined ? 'No description.' : arguments[0];

  // Trim the string.
  str = str.trim();

  // Ensure there is a final dot.
  if (!str.endsWith('.')) {
    str += '.';
  };

  return str;
};

function parseArgs(args) {
  var parsedArgs = {};

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var argument = _step.value;

      var parsed = argument.match(ARGS_REGEX);

      if (parsed && parsed.length > 2) {
        parsedArgs[parsed[1]] = parsed[2];
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return parsedArgs;
};

exports.default = { debug: debug, cleanDescription: cleanDescription, parseArgs: parseArgs };