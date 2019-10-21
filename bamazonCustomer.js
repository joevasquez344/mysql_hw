var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
})

connection.connect(function (err) {
    if (err) throw err;
    console.log('\n\nconnected as id: ' + connection.threadId + '\n');
    afterConnection();
})

var afterConnection = function () {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log('\n' +
                'Product ID: ' + res[i].product_id + '\n' +
                'Product Name: ' + res[i].product_name + '\n' +
                'Product Price: ' + res[i].price + '\n' +
                'Product Quantity: ' + res[i].stock_quantity +
                '\n\n')
        }

        inquirer
            .prompt([
                // Here we create a basic text prompt.
                {
                    type: "input",
                    message: "What ID does the product you want to buy have?",
                    name: "id"
                },
                {
                    type: "input",
                    message: "How many units of this product would you like to purchase?",
                    name: "units"
                }
            ])

            .then(function (response) {
                connection.query('SELECT * FROM products', function (err, res) {
                    if (err) throw err;
                    if (!response.id || !response.units) {
                        console.log('\n' +
                            'Error: Please Complete Your Request' +
                            '\n'
                        )
                    } else if (response.id && response.units) {
                        for (var i = 0; i < res.length; i++) {
                            var productName = res[i].product_name;
                            var unitsSelected = response.units
                            if (res[i].product_id == response.id) {
                                if (res[i].stock_quantity >= response.units && res[i].stock_quantity >= 0) {
                                    // var newQuantity = res[i].stock_quantity -= response.units;
                                    // console.log(newQuantity);
                                    var checkoutPrice = res[i].price * response.units;
                                    connection.query('UPDATE products SET ? WHERE ?', [
                                        {
                                            stock_quantity: res[i].stock_quantity -= unitsSelected
                                        },
                                        {
                                            product_id: res[i].product_id
                                        }
                                    ], function (err, res) {
                                        if (err) throw err;
                                        console.log(res.affectedRows + " product(s) updated!\n");
                                        console.log('==================================')
                                        console.log('\n' +
                                            'You have selected ' + unitsSelected + ' ' + productName + '(s)' + ' to purchase.' + '\n' +
                                            'Your total is ' + '$' + checkoutPrice + '\n\n' + '========================'
                                        )

                                    })
                                }
                                else {
                                    console.log('\n\nInsufficient Quantity!');
                                    return false;
                                }
                            }
                        }
                    }
                    connection.end();
                })
            });
    })
}

