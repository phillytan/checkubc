#!/usr/bin/env node

const scrape = require('./scrape');
let courses = require('./worklists/philly-main');

courses.forEach(response => {
    scrape(response);
});
