// variables that contain all the required modules
//express handles the information sent from the html page
var express = require('express');
var app = express();
//mysql makes it possible to write MySQL commands inside a js file
var mysql = require('mysql');
//bodyParser reads the information sent through the POST requests as parts of the html page(such as a reading the value of an element with a certain id)
var bodyParser = require('body-parser');
//express-upload makes it possible to upload files using express
var upload = require('express-fileupload');
//mkdirp makes it possible for the server to create folders
var mkdirp = require('mkdirp');

var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

app.use(upload());

//connects to the database
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'claudio',
    password: '1234',
    database: 'customerdirectory'
});
//logs if the connection was successful
connection.connect(function(err) {
    if (err) {
        throw err;
    }
    else {
        console.log('Connected');
    }
});

//due to a design limitation, there can't be more than X images split through all users(50 was the number decided but it can be changed to hold more by changing the i value here and on the .html page)
var i = 50;
//function that handles uploading the pictures
app.post('/upload', urlencodedParser, function(req, res) {
    if (!req.files) {
        console.log('No file detected');
        return res.send('No files were uploaded.');
    }
    var sampleFile = req.files.sampleFile;
    //bodyParser reads the loggedInUser, this is then used to decide the folder
    var user = req.body.userInput;
    // if there are more than 50 pictures they will start being replaced
    if (i < 0) {
        i = 50;
    }
    console.log(i);
    sampleFile.mv('public/users/' + user + "/" + i + ".png", function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        console.log('File uploaded!');
        res.redirect('back');
    });
    i--;
});

//same function as above but only holds 1 photo, this being the users avatar
app.post('/uploadAvatar', urlencodedParser, function(req, res) {
    if (!req.files) {
        console.log('No file detected');
        return res.send('No files were uploaded.');
    }
    var avatarFile = req.files.avatarFile;
    var avatarUser = req.body.avatarInput;
    avatarFile.mv('public/users/' + avatarUser + "/avatar.png", function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        console.log('File uploaded!');
        res.redirect('back');
    });
});

//fetches the user info from the SQL database and compares it with the values the user used when logging in
app.post('/loginAct', urlencodedParser, function(req, res) {
    var query = 'SELECT * FROM customer WHERE email = ? AND password = ?';
    connection.query(query, [req.body.email, req.body.password], function(err, result) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        if (result != [] && result != "") {
            var email = result[0].email;
            console.log(email);
            console.log(result);
            //this res.send(email) sends the email fetched from the sql database that is then used to create the sessionStorage object
            res.send(result);
        }
        else {
            res.send('no');
            console.log(result);
        }
    });
});

app.post('profile', urlencodedParser)

//takes all the values given by the user during registration and, if everything is ok, adds them to the database in the form of a new user
app.post('/register', urlencodedParser, function(req, res) {
    var query = 'INSERT INTO customer (email, first_name, last_name, password, street, city, phone) VALUES (?, ?, ?, ?, ?, ?, ?)';
    //checks if any field was left empty
    if (req.body.email == "" || req.body.firstName == "" || req.body.lastName == "" || req.body.password == "" || req.body.street == "" || req.body.city == "" || req.body.phone == "") {
        res.send('Fields missing');
        console.log('Fields missing');
    }
    else {
        connection.query(query, [req.body.email, req.body.firstName, req.body.lastName, req.body.password, req.body.street, req.body.city, req.body.phone], function(err, result) {
            if (err) {
                res.send(err);
                console.log(err);
            }
            // if there is no error creates a user as well as a folder for them
            else {
                res.send('User registered');
                mkdirp("/xampp/htdocs/SinglePageCoursework/public/users/" + req.body.email + "", function(err) {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        (console.log('Folder created'));
                    }
                });
                console.log(result);
            }
        });
    }
});

//tells the server.js page where all the static files are
app.use(express.static('public'));

//function that starts the server with a specific port
app.listen(8080, function(err) {
    if (err) {
        throw err;
    }
    else {
        console.log('Server started on port 8080');
    }
});