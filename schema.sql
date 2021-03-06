DROP DATABASE IF EXISTS company;
CREATE DATABASE company;

USE company;

CREATE TABLE departments (
    id INT AUTO_INCREMENT,
    name VARCHAR(30),
    PRIMARY KEY(id)
);

CREATE TABLE roles (
    id INT AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    PRIMARY KEY(id),
    FOREIGN KEY(department_id)
		REFERENCES departments(id)
        ON DELETE CASCADE
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(role_id)
		REFERENCES roles(id)
        ON DELETE CASCADE
);
