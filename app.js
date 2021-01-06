const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const { identity } = require("rxjs");

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    // Be sure to update with your own MySQL password!
    password: 'password',
    database: 'company',
  });
  
  // Initiate MySQL Connection.
  connection.connect((err) => {
    if (err) {
      console.error(`error connecting: ${err.stack}`);
      return;
    }
    console.log(`connected as id ${connection.threadId}`);
  });


const mainMenu = [
    "Add department", 
    "Add role", 
    "Add employee", 
    "View departments", 
    "View roles", 
    "View employees", 
    "Update employee department",
    "Update employee roles",
    "Update employee manager",
    "Exit"
];

const menu = function () {
    inquirer
        .prompt(
            {
                type: "list",
                name: "main",
                message: "What would you like to do?",
                choices: mainMenu,
            }
        ).then((answer) => {
            optionSwitch(answer.main);
        });
}

const optionSwitch = function (option) {
    switch(option){
        case "Add department": addDepartment();
        break;
        case "Add role": addRole();
        break; 
        case "Add employee": addEmployee();
        break;
        case "View departments": viewDepartments();
        break;
        case "View roles": viewRoles();
        break; 
        case "View employees": viewEmployees();
        break; 
        case "Update employee department": updateEDepartment();
        break;
        case "Update employee roles": updateERoles();
        break;
        case "Update employee manager": updateEManager();
        break;
        case "Exit": exit(0);
    }
}

const addDepartment = function () {
    inquirer
        .prompt(
            {
                type: "input",
                name: "depName",
                message: "Enter the name of the department",
            }
        ).then((answer) => {
            connection.query(
                'INSERT INTO departments SET ?',
                {"name": [answer.depName]},
                (err, result) => {
                    if(err) throw err;
                    console.log("Added department to database");
                    menu();
                }
            )
        });
}

const addRole = function () {
    var deptChoices = [];
    connection.query("SELECT name FROM departments", (err, rows, fields) => {
        if(err) throw err;
        for (var i of rows) {
            deptChoices.push(i);
        }  
    })
    console.log(deptChoices);
    // addRoleQs(deptChoices);
}

const addRoleQs = function (choiceArr) {
    inquirer
        .prompt(
            {
                type: "list",
                name: "departmentID",
                message: "Which department does this role belong to?",
                choices: choiceArr,
            },
            {
                type: "input",
                name: "title",
                message: "Enter the title for this role",
            },
            {
                type: "input", 
                name: "salary",
                message: "What is the salary for this position?",
            }
        ).then((answer) => {
            var test = connection.query(`SELECT id FROM departments WHERE name = ${answer.department_id}`);
            console.log(test);
            connection.query(
                'INSERT INTO roles SET ?',
                {
                    "title": answer.title,
                    "salary": answer.salary,
                    "department_id": test,
                },
                (err, result) => {
                    if(err) throw err;
                    console.log("Added role to database");
                    menu();
                }
        )
    });
}

menu();