var con = require('./connection');
var inquirer = require('inquirer');
var Table = require('cli-table');

var X = console.log;

con.connect(function (err) {
  if (err) throw err;
  main();
});

var commands = ['VIEW PRODUCT', 'ADD PRODUCT', 'LOW INVENTORY', 'REFILL INVENTORY', 'EXIT'];

function main() {
  X('');
  inquirer.prompt([
  {
    type: 'list',
    message: ('COMMANDS:'),
    choices: commands,
    name: 'command',
  }
  ]).then(function (answer) {
    switch (answer.command) {
      case 'VIEW PRODUCT':
      showProducts();
      break;
      case 'ADD PRODUCT':
      addProduct();
      break;
      case 'LOW INVENTORY':
      viewInventory();
      break;
      case 'REFILL INVENTORY':
      addInventory();
      break;
      case 'EXIT':
      process.exit(0);
    };
  });
};

function showProducts() {
  con.query('SELECT item_id, product_name, department_name, price, stock_quantity FROM products', function (err, res) {
    if (err) throw err;
    var productsTable = new Table({
      head: ['ID', 'Name', 'Department', 'Price', 'Quantity'],
      colWidths: [4, 30, 15, 10, 10]
    });
    for (var i = 0; i < res.length; i++) {
      productsTable.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
    };
    X(productsTable.toString());
    main();
  });
};

function addProduct() {

  con.query('SELECT department_name FROM departments;', function(err,res){
    if (err) throw err;
    var departments = [];
    for (var i=0; i<res.length; i++) {
      departments.push(res[i].department_name);
    };

    inquirer.prompt([
    {
      message: 'NAME',
      name: 'name',
      validate: function (value) {
        if (value == '') {
          return false;
        }
        return true;
      },
    }, {
      message: 'DEPARTMENT',
      name: 'department',
      type: 'list',
      choices: departments
    }, {
      message: 'PRICE',
      name: 'price',
      validate: function (value) {
        if (isNaN(value) === false) {
          if (value == '') {
            return false;
          }
          return true;
        }
        return false;
      },
    }, {
      message: 'QUANTITY',
      name: 'inventory',
      validate: function (value) {
        if (isNaN(value) === false) {
          if (value == '') {
            return false;
          }
          return true;
        }
        return false;
      },
    },
    ]).then(function (answer) {
      var name = answer.name;
      var price = parseInt(answer.price);
      var inventory = parseInt(answer.inventory);
      if (department == '') {
        con.query(`INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("${name}", NULL, ${price}, ${inventory});`, function (err, res) {
          if (err) throw err;
          X(`Added ${inventory} units of ${name} at $${price} each.`);
          main();
        });
      } else {
        var department = answer.department;
        con.query(`INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("${name}", "${department}", ${price}, ${inventory});`, function (err, res) {
          if (err) throw err;
          X(`Added ${inventory} units of ${name} at $${price} each.`);
          main();
        });
      };
    });
  });
};

function viewInventory() {
  con.query('SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE stock_quantity<5', function (err, res) {
    if (err) throw err;
    var lowTable = new Table({
      head: ['ID', 'Name', 'Department', 'Price', 'Quantity'],
      colWidths: [4, 30, 15, 10, 10]
    });
    for (var i = 0; i < res.length; i++) {
      lowTable.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
    };
    X(lowTable.toString());
    main();
  });
};

function addInventory() {
  con.query('SELECT item_id, product_name, stock_quantity FROM products', function (err, res) {
    if (err) throw err;

    var itemNames = [];
    for (var i = 0; i < res.length; i++) {
      itemNames.push(res[i].product_name);
    };

    inquirer.prompt([
    {
      type: 'list',
      choices: itemNames,
      message: 'SELECT ITEM VIA ID',
      name: 'product'
    }, {
      type: 'input',
      message: 'QUANTITY',
      name: 'units',
      validate: function (value) {
        if (value == '') return false;
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      },
    }
    ]).then(function (answer) {
      var productToAdd = answer.product;
      var amountToAdd = parseInt(answer.units);

      con.query('UPDATE products SET stock_quantity=stock_quantity+? WHERE ?', [
        amountToAdd,
        { product_name: productToAdd }
        ], function (err, res) {
          if (err) throw err;
          X(`ADDED ${amountToAdd} UNITS OF ${productToAdd}.`);
          main();
        });
    });
  });
};
