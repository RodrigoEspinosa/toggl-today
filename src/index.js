'use strict';

import chalk from 'chalk';
import fetch from 'node-fetch';
import utils from './utils';

const TOGGL_TOKEN = process.env.TOGGL_TOKEN;
const TOGGLE_URL = 'https://www.toggl.com/api/v8';
const TOGGLE_PROJECTS_URL = TOGGLE_URL + '/projects';
const TOGGL_TIME_ENTRIES_URL = TOGGLE_URL + '/time_entries';

if (!TOGGL_TOKEN) {
  console.error('Missing TOGGL_TOKEN!');
  process.exit(1);
}

let headers = {
  'Authorization': 'Basic ' + new Buffer(TOGGL_TOKEN).toString('base64')
};

utils.debug(headers);

const getDates = () => {
  const PROGRAM_ARGS = utils.parseArgs(process.argv);
  let today;

  if (PROGRAM_ARGS.date) {
    today = new Date(PROGRAM_ARGS.date.replace('-', '/'));
  } else {
    today = new Date();

    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
  }

  let tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  let startDate = encodeURIComponent(today.toJSON());
  let endDate = encodeURIComponent(tomorrow.toJSON());

  return {startDate, endDate};
};

let {startDate, endDate} = getDates();
let urlParams = `?start_date=${startDate}&end_date=${endDate}`;

utils.debug(TOGGL_TIME_ENTRIES_URL + urlParams);

// Get the time entries.
fetch(TOGGL_TIME_ENTRIES_URL + urlParams, {headers: headers})
  // Convert to JSON.
  .then((response) => response.json())

  // Create project instances.
  .then((entries) => {
    // Group the entries by `pid` (Project Id).
    const projects = new Map();

    // Iterate over all entries.
    entries.map((entry) => {
      let projectEntries;

      if (projects.has(entry.pid)) {
        projectEntries = projects.get(entry.pid);
      } else {
        projectEntries = {duration: 0, descriptions: new Set()};
      }

      // Clean the entry description.
      entry.description = utils.cleanDescription(entry.description);

      projectEntries.descriptions.add(entry.description);
      projectEntries.duration += entry.duration;

      projects.set(entry.pid, projectEntries);
    });

    return projects;
  })

  // Get projects names.
  .then((projects) => {
    let projectsToFetch = [];

    // Get the project names.
    for (let pid of projects.keys()) {
      let getCurrentProjectData = fetch(TOGGLE_PROJECTS_URL + '/' + pid, {headers: headers})
        .then((response) => response.json())
        .then((project) => {
          let projectInstance = projects.get(project.data.id);
          projectInstance.name = project.data.name;
        });

      projectsToFetch.push(getCurrentProjectData);
    }

    return Promise.all(projectsToFetch).then(() => projects);
  })

  // Display entries.
  .then((projects) => {
    for (let project of projects.values()) {
      let hours = (project.duration / 3600).toFixed(2);

      // Display the project name and his hours of the day.
      console.log(chalk.green(`${chalk.bold(project.name)}: ${hours} hours`));
      console.log(chalk.green(Array(60).join('=')));

      // Display the description.
      for (let description of project.descriptions.values()) {
        console.log(description);
      }

      console.log('');
    }
  })
  .catch((err) => console.error('There was an error:', err));
