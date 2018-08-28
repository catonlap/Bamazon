var con = require('./connection');
var inquirer = require('inquirer');
var Table = require('cli-table');

var X = console.log;

con.connect(function (err) {
  if (err) throw err;
  showInventory();
});

function reset() {
  inquirer.prompt([{
    type: 'confirm',
    message: 'Continue shopping?',
    name: 'confirm',
  }]).then(function (answer) {
    if (answer.confirm) {
      showInventory();
    } else {
      process.exit(0);
    };
  });
};

function showInventory() {
  con.query('SELECT item_id, product_name, department_name, price, stock_quantity FROM products', function (err, res) {
    if (err) throw err;
    var productsTable = new Table({
      head: ['ID', 'Name', 'Department', 'Price', 'In Stock'],
      colWidths: [4, 30, 15, 10, 10]
    });
    for (var i = 0; i < res.length; i++) {
      productsTable.push([res[i].item_id, res[i].product_name, res[i].department_name, "$"+res[i].price, res[i].stock_quantity]);
    };
    X(productsTable.toString());
    prompt(res.length);
  });
};

function prompt(numberOfItems) {
  inquirer.prompt([
    {
      type: 'input',
      message: "Select item to buy VIA its ID",
      name: 'id',
      validate: function (value) {
        if (value.toLowerCase() === 'x') {
          process.exit(0);
        }
        if (isNaN(value) === false && parseInt(value) <= numberOfItems && parseInt(value) > 0) {
          return true;
        }
        return false;
      }
    }, {
      type: 'input',
      message: "Input quantity to buy",
      name: 'qty',
      validate: function (value) {
        if (value.toLowerCase() === 'x') {
          process.exit(0);
        }
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      },
    }]).then(function (answer) {
      con.query("SELECT stock_quantity FROM products WHERE item_id=?", answer.id, function (err, res) {
        if (err) throw err;
        var qty = res[0].stock_quantity;
        if (qty >= answer.qty) {

          var qtyRemaining = qty - answer.qty;
          con.query("UPDATE products SET ? WHERE ?", [
            { stock_quantity: qtyRemaining }, { item_id: answer.id }
          ], function (err, res) {
            if (err) throw err;
            con.query("SELECT price, department_name FROM products WHERE item_id=?", [answer.id], function (err, res) {
              if (err) throw err;
              var total = answer.qty * res[0].price;
              var departmentName = res[0].department_name;
              X('YOUR TOTAL IS $' + total) + '.\n';

              // supervisor
              updateSales(answer.id, total, departmentName);

              reset();
            });
          });

        } else {
          X(`WE ONLY HAVE ${qty} IN STOCK, PLEASE TRY AGAIN LATER`);
          reset();
        };
      });
    });
};

// Function for the "supervisor.js" functionality
function updateSales(id, total, dept) {
  con.query(`UPDATE products SET product_sales=${total} WHERE item_id=${id};`, function(err,res){
    if (err) throw err;
    con.query(`UPDATE departments SET total_sales=total_sales+${total} WHERE department_name="${dept}";`, function(err,res){
      if (err) throw err;
    });
  });
};