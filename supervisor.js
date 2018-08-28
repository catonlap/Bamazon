var con = require('./connection');
var inquirer = require('inquirer');
var Table = require('cli-table');

var X = console.log;

con.connect(function (err) {
  if (err) throw err;
  main();
});

var commands = ['VIEW DEPARTMENTS', 'CREATE DEPARTMENT', 'EXIT'];

function main() {
  inquirer.prompt([
  {
    name: 'command',
    message: ('COMMAND'),
    type: 'list',
    choices: commands,
  }
  ]).then(function(answer){
    switch (answer.command) {
      case 'VIEW DEPARTMENTS':
      viewSales();
      break;
      case 'CREATE DEPARTMENT':
      createNewDept();
      break;
      case 'EXIT':
      process.exit(0);
    };
  });
};

function viewSales() {
  X('');
  con.query("SELECT * FROM departments;", function(err,res){

    var table = new Table({
      head: ['Dept ID', 'Dept Name', 'Overhead Costs', 'Product sales', 'Total profit'],
      colWidths: [9, 15, 16, 15, 14]
    });
    var totalProfit = [];
    for (var i = 0; i < res.length; i++) {

      totalProfit[i] = res[i].total_sales - res[i].over_head_costs;

      table.push([res[i].department_id, res[i].department_name, '$'+res[i].over_head_costs, '$'+res[i].total_sales, '$'+totalProfit[i]]);
    };
    X(table.toString());
    main();
  });
};


function createNewDept() {
  X('');
  inquirer.prompt([{
    name: 'department',
    message: 'DEPARTMENT',
    validate: function (value) {
      if (value == '') {
        X('ENTER A DEPARTMENT NAME');
        return false;
      }
      return true;
    },
  }, {
    name: 'overhead',
    message: 'OVERHEAD COST',
    validate: function (value) {
      if (isNaN(value) === false) {
        if (value == '') {
          X('ENTER AN OVERHEAD COST');
          return false;
        }
        return true;
      }
      return false;
    },
  }]).then(function(answer){
    con.query("INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?);", [answer.department, parseFloat(answer.overhead)],function(err,res){
      if (err) throw err;
      X(`NEW DEPARTMENT: ${answer.department}`);
      main();
    });
  });
};
