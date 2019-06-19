#!/usr/bin/env node

const prompts = require('prompts');
const scrape = require('./scrape');

const questions = [
    {
      type: 'text',
      name: 'dept',
      message: 'Department:'
    },
    {
      type: 'number',
      name: 'class',
      message: 'Class:'
    },
    {
      type: 'text',
      name: 'section',
      message: 'Section:'
    },
    {
        type: "confirm",
        name: "restricted",
        message: "Do you qualify for Restricted Course?",
        initial: false
    }
];

(async () => {
    const response = await prompts(questions);
    response.dept = response.dept.toUpperCase();
    scrape(response);
})();
