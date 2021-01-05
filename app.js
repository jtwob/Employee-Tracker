const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const mainMenu = [
    "Add department", 
    "Add role", 
    "Add employee", 
    "View departments", 
    "View roles", 
    "View employees", 
    "Update employee department",
    "Update employee roles",
    "Update employee manager"
];

