DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products(
 item_id INT NOT NULL AUTO_INCREMENT,
 product_name VARCHAR(45) NOT NULL,
 department_name VARCHAR(45) NOT NULL,
 price DECIMAL(10,2) DEFAULT 10.00,
 stock_quantity INT DEFAULT 0,
 PRIMARY KEY(item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES
 ('Laptop', 'Electronics', 1000.00, 1),
 ('Hammer', 'Hardware', 15, 10),
 ('Toilet Paper', 'Toiletries', 5, 50),
 ('Apple', 'Food', 1, 100);

CREATE TABLE departments(
 department_id INT NOT NULL AUTO_INCREMENT,
 department_name VARCHAR(45) NOT NULL,
 over_head_costs INT(10) DEFAULT 0,
 total_sales INT(10) DEFAULT 0,
 PRIMARY KEY(department_id)
);

ALTER TABLE products ADD COLUMN
product_sales INT(20) DEFAULT 0;

INSERT INTO departments (department_name, over_head_costs)
VALUES
 ('Electronics', 1000),
 ('Food', 250),
 ('Hardware', 100),
 ('Toiletries', 50);
