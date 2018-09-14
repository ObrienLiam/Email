var ejs = require('ejs');
var express = require('express');
var QS = require('querystring');
var mysql = require('mysql');
var cookieParser = require("cookie-parser");
var url = require('url');
var session = require('express-session')

var app = express();

var BadEntry = 'false';

var con = mysql.createConnection({
  host: 'localhost',
  user:'root',
  password: '',
  database: 'EmailDB'
});

app.set("view engine", ejs);

app.use(session( {secret: 'email',
  resave: false,
saveUnitialized: true,
cookie: {maxAge: 60000}
}));

app.use(cookieParser());

app.use("/inbox", function(req, res, next){
  if (req.session.email){
    next();
  }
  else {
    BadEntry='true';
    res.redirect("/login");
  }
});

app.get("/start", function(req, res) {
  res.render("StartUp.ejs");
});

app.get("/login", function(req, res) {
  res.render("Login.ejs", {'Check':BadEntry, 'New':'false'});
  BadEntry='false';
});

app.get("/create", function(req, res) {
  res.render("Create.ejs", {'Pass':'false'});
});

app.post("/create/new", function(req, res) {
  var data = "";
  var form;

  req.on("data", (x) => {
    data += x;
  });

  req.on("end", () => {
    form = QS.parse(data);
    var insertQuery = `INSERT INTO User VALUES ( NULL, '${form.Name}', '${form.Email}', '${form.Pass1}' ) `;
    if (form.Pass1==form.Pass2){
      con.query(insertQuery);
      res.render("Login.ejs", {'Check':'false', 'New':'true'});
    }
    else{
      res.render("Create.ejs", {'Pass':'true'});
    }
  });
});

app.post("/login/load", function(req, res) {
  var data = "";
  var form;

  req.on("data", (x) => {
    data += x;
  });
  req.on("end", () => {
    form = QS.parse(data);
    var selectQuery = `select * from User where Email='${form.Email}'`;
    con.query(selectQuery, function(error, record){
      if (error) throw error
      else {
        if (record[0].Password==form.Pass) {
          req.session.email=form.Email;
          req.session.password=form.Pass;
          req.session.name=record[0].Name;
        }
        res.redirect("/inbox");
        res.end();
      }
    });
  });
});

app.get("/inbox", function(req, res) {
  var selectQuery=`SELECT * FROM EMAIL WHERE EMAIL_TO='${req.session.email}'`
  con.query(selectQuery, (err, data) => {
    res.render("Inbox.ejs", {'Name':req.session.name,'data':data});
  });

});

app.post("/inbox/delete", function(req, res) {
  var data = "";
  var form;

  req.on("data", (x) => {
    data += x;
  });
  req.on("end", () => {
    form = QS.parse(data);
    Object.keys(form).forEach( (x) => {
      3
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
      //delete from where eid=x
    });
  });
  res.end();
});

app.get("/inbox/read/:id", function(req, res) {
  var selectQuery=`SELECT * FROM EMAIL WHERE EID='${req.params.id}'`
  con.query(selectQuery, (err, data) => {
    console.log(data[0].Body);
    res.render("Read.ejs", {'From':data[0].Email_From, 'Subject':data[0].Subject, 'Body':data[0].Body});
  });

});

app.get("/logout", function(req, res) {
  req.session.destroy();
  res.redirect("/start");
});

app.listen(8000);
