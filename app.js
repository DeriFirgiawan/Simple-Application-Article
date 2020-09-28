const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const Article = require("./models/article");
const passport = require('passport');
const config = require('./config/database');

// connection mongodb
mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

let db = mongoose.connection;
// check connection
db.once('open', () => {
  console.log('Connected to Mongodb');
});

// check for DB error
db.on('error', (err) => {
  console.log(err);
});

// init app
const app = express();



// load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set public Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Password Config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// home route
app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title: 'Say Hello',
        articles: articles
      });
    }
  });
});

// route files
const articles = require('./routes/articles');
const users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
