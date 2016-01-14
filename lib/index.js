'use strict';

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TOGGL_TOKEN = process.env.TOGGL_TOKEN;
var TOGGLE_URL = 'https://www.toggl.com/api/v8';
var TOGGLE_PROJECTS_URL = TOGGLE_URL + '/projects';
var TOGGL_TIME_ENTRIES_URL = TOGGLE_URL + '/time_entries';

if (!TOGGL_TOKEN) {
  console.error('Missing TOGGL_TOKEN!');
  process.exit(1);
}

var headers = {
  'Authorization': 'Basic ' + new Buffer(TOGGL_TOKEN).toString('base64')
};

_utils2.default.debug(headers);

var getDates = function getDates() {
  var PROGRAM_ARGS = _utils2.default.parseArgs(process.argv);
  var today = undefined;

  if (PROGRAM_ARGS.date) {
    today = new Date(PROGRAM_ARGS.date.replace('-', '/'));
  } else {
    today = new Date();

    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
  }

  console.log(today);

  var tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  var startDate = encodeURIComponent(today.toJSON());
  var endDate = encodeURIComponent(tomorrow.toJSON());

  return { startDate: startDate, endDate: endDate };
};

var _getDates = getDates();

var startDate = _getDates.startDate;
var endDate = _getDates.endDate;

var urlParams = '?start_date=' + startDate + '&end_date=' + endDate;

_utils2.default.debug(TOGGL_TIME_ENTRIES_URL + urlParams);

// Get the time entries.
(0, _nodeFetch2.default)(TOGGL_TIME_ENTRIES_URL + urlParams, { headers: headers })
// Convert to JSON.
.then(function (response) {
  return response.json();
})

// Create project instances.
.then(function (entries) {
  // Group the entries by `pid` (Project Id).
  var projects = new Map();

  // Iterate over all entries.
  entries.map(function (entry) {
    var projectEntries = undefined;

    if (projects.has(entry.pid)) {
      projectEntries = projects.get(entry.pid);
    } else {
      projectEntries = { duration: 0, descriptions: new Set() };
    }

    // Clean the entry description.
    entry.description = _utils2.default.cleanDescription(entry.description);

    projectEntries.descriptions.add(entry.description);
    projectEntries.duration += entry.duration;

    projects.set(entry.pid, projectEntries);
  });

  return projects;
})

// Get projects names.
.then(function (projects) {
  var projectsToFetch = [];

  // Get the project names.
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = projects.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var pid = _step.value;

      var getCurrentProjectData = (0, _nodeFetch2.default)(TOGGLE_PROJECTS_URL + '/' + pid, { headers: headers }).then(function (response) {
        return response.json();
      }).then(function (project) {
        var projectInstance = projects.get(project.data.id);
        projectInstance.name = project.data.name;
      });

      projectsToFetch.push(getCurrentProjectData);
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

  return Promise.all(projectsToFetch).then(function () {
    return projects;
  });
})

// Display entries.
.then(function (projects) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = projects.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var project = _step2.value;

      var hours = (project.duration / 3600).toFixed(2);

      // Display the project name and his hours of the day.
      console.log(_chalk2.default.green(_chalk2.default.bold(project.name) + ': ' + hours + ' hours'));
      console.log(_chalk2.default.green(Array(60).join('=')));

      // Display the description.
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = project.descriptions.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var description = _step3.value;

          console.log(description);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      console.log('');
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}).catch(function (err) {
  return console.error('There was an error:', err);
});