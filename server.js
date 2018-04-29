var express = require('express');
var mysql = require('mysql');
var expressValidator = require('express-validator');
var expressSession = require('express-session');
var app = express();
var bodyParser = require('body-parser');
var upload = require('express-fileupload');

var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

app.use(upload());

app.use(expressSession({
    secret: 'secret',
    saveUninitialized: false,
    resave: false,
}));

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'claudio',
    password: '1234',
    database: 'customerdirectory'
});

connection.connect(function(err) {
    if (err) {
        throw err;
    }
    else {
        console.log('Connected');
    }
});


app.post('/upload', function(req, res) {
    if (!req.files) {
        console.log('No file detected');
        return res.status(400).send('No files were uploaded.');
    }
    var sampleFile = req.files.sampleFile;

    sampleFile.mv('public/images/display/' + sampleFile.name, function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        console.log('File uploaded!');
        res.redirect('back');
    });
});


app.post('/loginAct', urlencodedParser, function(req, res) {
    var query = 'SELECT * FROM customer WHERE email = ? AND password = ?';
    connection.query(query, [req.body.email, req.body.password], function(err, result) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        if (result != [] && result != "") {
            var id = result[0].id;
            console.log(id);
            res.send("" + id);
        }
        else {
            res.send('User not found');
            console.log(result);
        }
    });
});

app.post('/register', urlencodedParser, function(req, res) {
    var query = 'INSERT INTO customer (email, first_name, last_name, password, street, city, phone) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [req.body.email, req.body.firstName, req.body.lastName, req.body.password, req.body.street, req.body.city, req.body.phone], function(err, result) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        if (req.body.email == "" || req.body.firstName == "" || req.body.lastName == "" || req.body.password == "" || req.body.street == "" || req.body.city == "" || req.body.phone == "") {
            res.send('Fields nissing');
            console.log(result);
        }
        else {
            res.send('User registered');
            console.log(result);
        }
    });
});

app.use(express.static('public'));

app.listen(8080, function(err) {
    if (err) {
        throw err;
    }
    else {
        console.log('Server started on port 8080');
    }
});