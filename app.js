const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const mongojs = require('mongojs');
const db = mongojs('customerapp', ['users']);
const ObjectId = mongojs.ObjectId;
const app = express();

// middleware
// let logger = (req, res, next) => {
//   console.log('Logging...');
//   next();
// }
//
// app.use(logger);

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set static path
app.use(express.static(path.join(__dirname, 'public')));

// Global variables
app.use((req, res, next) => {
  res.locals.errors = null;
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    let namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.unshift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

let users = [
  {
    first_name: 'Jo',
    last_name: 'Woah',
    email: 'jowoah@gmail.com'
  },
  {
    first_name: 'Jill',
    last_name: 'Woah',
    email: 'jillwoah@gmail.com'
  }
];

app.get('/', (req, res) => {
  db.users.find((err, docs) => {
    // an array of all the documents in users
    console.log(docs);
    res.render('index', {
      title: 'Customers',
      users: docs
    });
  });
});

app.post('/users/add', (req, res) => {
  req.checkBody('first_name', 'First name is Required').notEmpty();
  req.checkBody('last_name', 'Last name is Required').notEmpty();
  req.checkBody('email', 'Email is Required').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    res.render('index', {
      title: 'Customers',
      users: users,
      errors: errors
    });
  } else {
    let newUser = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email
    };

    // adds newUser object to users collection
    db.users.insert(newUser, (err, result) => {
      if (err) console.log(err);
      // newUser is added and the page reloads with the new information
      res.redirect('/');
    });

    console.log('Success');
  }
});

app.delete('/users/delete/:id', (req, res) => {
  db.users.remove({_id: ObjectId(req.params.id)}, (err, result) => {
    if (err) console.log(err);

    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
