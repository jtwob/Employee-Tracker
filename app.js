//dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const { exitCode, exit } = require("process");

//Data for mysql connection
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

//array of menu items
const mainMenu = [
    "Add department", 
    "Add role", 
    "Add employee", 
    "View departments", 
    "View roles", 
    "View employees", 
    "Update employee roles",
    "Update employee manager",
    "Exit"
];

//menu prompt using inquirer
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

//directs program to correct function
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
        case "Update employee roles": updateRole();
        break;
        case "Update employee manager": updateManager();
        break;
        case "Exit": exit(0);
        default: return;
    }
}

//simple inquirer and sql add function
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

//creates an array of departments to be chosen from in addRoleQs
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

//allows for a new role to be constructed and added to the roles table with inquirer
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

//creates an array of roles to be chosen from in addEmployeeQs
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

//creates an array of employees to be chosen from in addEmployeeQs
const managerHelper = function (choiceArr){
    var temp = ["No Manager"];
    connection.query("SELECT * FROM employees", function (err, rows, fields) {
        if(err) throw err;
        // console.log(rows);
        for (var i of rows) {
            // console.log(i.first_name);
            temp.push(i.first_name + " " + i.last_name);
        }  
        addEmployeeQs(choiceArr, temp);
    });
}

//allows for a new employee to be added 
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
                // console.log(answer.manager.split(' ')[0])
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

//uses console.table to show the results of a simple sql selection
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

//uses console.table to show the results of a simple sql selection
// then replaces id's with names of departments with for loops
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

//uses console.table to show the results of a simple sql selection
// then replaces id's with names of departments, managers, salaries, and roles using loops
const viewEmployees = function () {
    let ret = [];
    let roles = [];
    let deps = [];

    connection.query("SELECT * FROM employees", (err, results) => {
        if(err) throw err;

        for(let i = 0; i < results.length; i++){
            ret.push([results[i].id, results[i].first_name, results[i].last_name, results[i].role_id, null, null, results[i].manager_id]);
        }

        connection.query("SELECT * FROM roles", (err, result1) => {
            if(err) throw err;

            for(let j = 0; j < result1.length; j++){
                roles.push([result1[j].id, result1[j].title, result1[j].salary, result1[j].department_id]);
            }
            for(let i = 0; i < ret.length; i++){
                for(let j = 0; j < roles.length; j++){
                    if(ret[i][3] === roles[j][0]){
                        ret[i][3] = roles[j][1];
                        ret[i][4] = roles[j][2];
                        ret[i][5] = roles[j][3];
                    }
                }
            }
            connection.query("SELECT * FROM departments", (err, result2) =>  {
                if(err)throw err;

                for(let i = 0; i < result2.length; i++){
                    deps.push({"id": result2[i].id, "name": result2[i].name});
                }
                for(let i = 0; i < ret.length; i++){
                    for(let j = 0; j < deps.length; j++){
                        if(ret[i][5] === deps[j].id){
                            ret[i][5] = deps[j].name;
                        }
                    }
                }
                for(let i = 0; i < ret.length; i++){
                    for(let j = 0; j < ret.length; j++){
                        if(ret[i][6] === ret[j][0]){
                            ret[i][6] = ret[j][1] + " " +ret[j][2];
                        }
                    }
                }
                console.log("\n");
                console.table(["ID", "first_name", "last_name", "role", "salary", "department", "manager"], ret);
            })
        })
    })
    menu();
}

//creates an array of employees to be used in updateERole
const updateRole = function () {
    var employeeArr = [];
    connection.query("SELECT id, first_name, last_name FROM employees", (err, result) => {
        if(err) throw err;
        for(let i = 0; i < result.length; i++){
            employeeArr.push(result[i].first_name + " " + result[i].last_name);
        }
        roleArrHelper(employeeArr);
    })
}

//creates an array of roles to be used in updateERole
const roleArrHelper = function(arr){
    var roleArr = [];
    connection.query("SELECT title FROM roles", (err, result) => {
        if(err) throw err;
        for(let i = 0; i < result.length; i++){
            roleArr.push(result[i].title);
        }
        updateERole(arr, roleArr);
    })
}

//user selects employee to be updated then the role to update to.
const updateERole = function (employeeArr, roleArr) {
    const questions = [
        {
            type: "list",
            name: "employee",
            message: "Which employee should be updated?",
            choices: employeeArr,
        },
        {
            type: "list",
            name: "role",
            message: "Which role should employee be moved to?",
            choices: roleArr,
        }
    ]
    inquirer.prompt(questions).then((answers)=>{
        connection.query(`SELECT id FROM roles WHERE title = '${answers.role}'`, (err, result) =>    {
            if(err) throw err;
            connection.query(`UPDATE employees SET role_id = ${result[0].id} WHERE first_name = '${answers.employee.split(' ')[0]}' AND last_name = '${answers.employee.split(' ')[1]}'`,
            (err, result1)=>
            {
                if(err) throw err;
                console.log("Successfully switched roles.");
            })
        })
        menu();
    })
}

//creates a list of employees used twice in updateManagerHelper
const updateManager = function () {
    const ret = [];
    connection.query("SELECT * FROM employees", (err, results) => {
        if(err) throw err;
        for(let i = 0; i < results.length; i++){
            ret.push(results[i].first_name + " " + results[i].last_name);
        }
        updateManagerHelper(ret);
    });
}

//runs through a list of employees once to select the one to update, and the second time to choose the new manager
const updateManagerHelper = function (arr) {
    console.log(arr);
    const questions = [
        {
            type: "list",
            name: "employee",
            message: "Which employee should be assigned a new manager?",
            choices: arr,
        },
        {
            type: "list",
            name: "manager",
            message: "Which employee will be the new manager?",
            choices: arr,
        }
    ]
    inquirer.prompt(questions).then((answer)=>{
        connection.query(`SELECT id FROM employees WHERE first_name = '${answer.manager.split(" ")[0]}' AND last_name = '${answer.manager.split(" ")[1]}'`, 
        (err, result)=>{
            if(err) throw err;
            connection.query(`UPDATE employees SET manager_id = ${result[0].id} WHERE first_name = '${answer.employee.split(' ')[0]}' AND last_name = '${answer.employee.split(' ')[1]}'`,
            (err, result1) => {
                if(err) throw err;
                console.log("Manager updated successfully");
                menu();
            })
        })
    })
}

//call menu
menu();