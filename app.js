#!/usr/bin/env node

const fs = require('fs');
const Browser = require('zombie');
const chalk = require('chalk');

let courses = [
    {
        dept: "COMM",
        class: "100",
        section: "201",
        restricted: false,
    },
    {
        dept: "CPSC",
        class: "110",
        section: "104",
        restricted: false,
    },
    {
        dept: "CPSC",
        class: "121",
        section: "103",
        restricted: false,
    },
    {
        dept: "CPSC",
        class: "210",
        section: "201",
        restricted: false,
    },
    {
        dept: "ECON",
        class: "101",
        section: "003",
        restricted: false,
    },
    {
        dept: "ECON",
        class: "102",
        section: "001",
        restricted: false,
    },
    {
        dept: "MATH",
        class: "184",
        section: "104",
        restricted: false,
    },
    {
        dept: "MATH",
        class: "105",
        section: "208",
        restricted: false,
    },
    {
        dept: "WRDS",
        class: "150",
        section: "05M",
        restricted: true,
    },
];

courses.forEach(response => {
    response.dept = response.dept.toUpperCase();
    let test1 = `https://courses.students.ubc.ca/cs/courseschedule?sessyr=2019&sesscd=W&pname=subjarea&tname=subj-section&dept=${response.dept}&course=${response.class}&section=${response.section}`;
    console.log(`Gathering data for ${chalk.cyan(response.dept + " " + response.class + " " + response.section)}`);
    Browser.visit(test1, (err, browser) => {
        let classData = {
            course_seats: {
                total: ((browser.text('div.content > table:nth-of-type(4) > tbody > tr:nth-of-type(1) > td:nth-of-type(2) > strong') === "") ? browser.text('div.content > table:nth-of-type(3) > tbody > tr:nth-of-type(1) > td:nth-of-type(2) > strong') : browser.text('div.content > table:nth-of-type(4) > tbody > tr:nth-of-type(1) > td:nth-of-type(2) > strong')),
                general: ((browser.text('div.content > table:nth-of-type(4) > tbody > tr:nth-of-type(3) > td:nth-of-type(2) > strong') === "") ? browser.text('div.content > table:nth-of-type(3) > tbody > tr:nth-of-type(3) > td:nth-of-type(2) > strong') : browser.text('div.content > table:nth-of-type(4) > tbody > tr:nth-of-type(3) > td:nth-of-type(2) > strong')),
            }
        };
        let num = (response.restricted ? classData.course_seats.total : classData.course_seats.general);
        let current = num;
        if (num > 20) current = chalk.bold(chalk.green(num));
        else if (num > 10) current = chalk.bold(chalk.yellow(num));
        else current = chalk.bold(chalk.red(num));
        let classInfo = chalk.cyan(response.dept + " " + response.class + " " + response.section);
        let filename = __dirname+"/db/"+response.dept + " " + response.class + " " + response.section + " " + response.restricted;
        if ((response.restricted ? classData.course_seats.total : classData.course_seats.general) == "") {
            if (browser.text('div.content > strong') === "Note: The remaining seats in this section are only available through a Standard Timetable (STT)") console.log(`${classInfo} is only available through a ${chalk.yellow("Standard Timetable (STT)")}.`);
            else if (!fs.existsSync(filename)) console.log(`Sorry but I couldn't check the number of seats available for ${classInfo}.`);
            else {
                fs.readFile(filename, "utf-8", (err, data) => {
                    let lastSaved = Number(data.split(" ")[data.split(" ").length-1]);
                    console.log(`Sorry but I couldn't check the number of seats available for ${classInfo}. There were ${chalk.yellow(lastSaved)} seats the last time I checked.`);
                });
            }
        } else {
            if (!fs.existsSync(filename)) {
                fs.writeFile(filename, (response.restricted ? classData.course_seats.total : classData.course_seats.general), () => {
                    console.log(`As of the moment, ${classInfo} has ${current} seats remaining.`);
                });
            } else {
                fs.readFile(filename, "utf-8", (err, data) => {
                    let lastSaved = Number(data.split(" ")[data.split(" ").length-1]); 
                    if (lastSaved !== Number(response.restricted ? classData.course_seats.total : classData.course_seats.general)) {
                        fs.writeFile(filename, (data + ` ${num}`), (err) => {if (err) console.error(err)});
                        console.log(`As of the moment, ${classInfo} has ${current} seats remaining. There were ${chalk.yellow(lastSaved)} seats the last time I checked.`);
                    } else {
                        console.log(`As of the moment, ${classInfo} has ${current} seats remaining. ${chalk.red("No changes")} since the last time I checked.`);
                    }
                });
            }
        }
    });
});
