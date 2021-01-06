const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const { exitCode, exit } = require("process");

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
        default: return;
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
    var temp = [];
    connection.query("SELECT name FROM departments", function (err, rows) {
        if(err) throw err;
        for (var i of rows) {
            temp.push(i.name);
        }  
        addRoleQs(temp);
    });
}

const addRoleQs = function (choiceArr) {
    let questions = [
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
    ];
    inquirer
        .prompt(questions).then((answer) => {
            connection.query(`SELECT id FROM departments WHERE name = '${answer.departmentID}'`, (err, result) => {
                if(err) throw err;
                connection.query(
                    'INSERT INTO roles SET ?',
                    {
                        "title": answer.title,
                        "salary": answer.salary,
                        "department_id": result[0].id,
                    },
                    (err, result) => {
                        if(err) throw err;
                        console.log("Added role to database");
                        menu();
                    }
                )
            });
    });
}

const addEmployee = function () {
    var temp = [];
    connection.query("SELECT title FROM roles", function (err, rows) {
        if(err) throw err;
        for (var i of rows) {
            temp.push(i.title);
        }  
        managerHelper(temp);
    });
}

const managerHelper = function (choiceArr){
    var temp = ["No Manager"];
    connection.query("SELECT * FROM employees", function (err, rows, fields) {
        if(err) throw err;
        // console.log(rows);
        for (var i of rows) {
            console.log(i.first_name);
            temp.push(i.first_name + " " + i.last_name);
        }  
        addEmployeeQs(choiceArr, temp);
    });
}

const addEmployeeQs = function (choiceArr, managerArr) {
    let questions = [
        {
            type: "input",
            name: "fName",
            message: "Enter employee's first name:",
        },
        {
            type: "input",
            name: "lName",
            message: "Enter employee's last name:",
        },
        {
            type: "list",
            name: "roles",
            message: "What role will this employee fill?",
            choices: choiceArr,
        },
        {
            type: "list",
            name: "manager",
            message: "Who is managing this employee?",
            choices: managerArr,
        }
    ];
    inquirer
    .prompt(questions).then((answer) => {
        connection.query(`SELECT id FROM roles WHERE title = '${answer.roles}'`, (err, result) => {
            if(err) throw err;
            if(answer.manager === "No Manager"){
                connection.query(
                    'INSERT INTO employees SET ?',
                    {
                        "first_name": answer.fName,
                        "last_name": answer.lName,
                        "role_id": result[0].id,
                        "manager_id": null,
                    },
                    (err, result) => {
                        if(err) throw err;
                        console.log("Added employee to database");
                        menu();
                    }
                )
            }else{
                console.log(answer.manager.split(' ')[0])
                connection.query(`SELECT id FROM employees WHERE first_name = '${answer.manager.split(' ')[0]}' AND last_name = '${answer.manager.split(' ')[1]}'`, (err, result2)=> {
                    if(err) throw err;
                    connection.query(
                        'INSERT INTO employees SET ?',
                        {
                            "first_name": answer.fName,
                            "last_name": answer.lName,
                            "role_id": result[0].id,
                            "manager_id": result2[0].id,
                        },
                        (err, result) => {
                            if(err) throw err;
                            console.log("Added employee to database");
                            menu();
                        }
                    )
                })
            }
        });
    });
}

const viewDepartments = function () {
    let ret = [];
    connection.query("SELECT * FROM departments", (err, result) => {
        if(err) throw err;
        for (let i = 0; i < result.length; i++){
            ret.push([result[i].id, result[i].name]);
        }
        console.log("\n")
        console.table(["id", "name"], ret);
    });
    menu();
}

const viewRoles = function() {
    let ret = [];
    let deps = [];
    connection.query("SELECT roles.id, roles.title, roles.salary, roles.department_id FROM roles", (err, results) => {
        if(err) throw err;
        for(let i = 0; i < results.length; i++){
            ret.push([results[i].id, results[i].title, results[i].salary, results[i].department_id]);
        }
        connection.query("SELECT * FROM departments", (err, result) =>  {
            for(let i = 0; i < result.length; i++){
                deps.push({"id": result[i].id, "name": result[i].name});
            }
            for(let i = 0; i < ret.length; i++){
                for(let j = 0; j < deps.length; j++){
                    if(ret[i][3] === deps[j].id){
                        ret[i][3] = deps[j].name;
                    }
                }
            }
            console.log("\n")
            console.table(["ID", "Title", "Salary", "Department"],ret);
        });
    });
    menu();
}

const viewEmployees = function () {
    let ret = [];
    let roles = [];
    let deps = [];
}

menu();