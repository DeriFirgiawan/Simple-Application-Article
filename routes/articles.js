const express = require('express');
const router = express.Router();

// Bring in Article Models
const Article = require('../models/article');
const User = require("../models/user");


// add route
router.get('/add', ensureAuthenticated,(req, res) => {
  res.render('add_article', { title: 'Create Your Articles' });
});

// add Submit Post route
router.post('/add', (req, res) => {
  const article = new Article();
  article.title = req.body.title;
  article.author = req.user._id;
  article.body = req.body.body;

  article.save((err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article Added');
      res.redirect('/');
    }
  });
});

// load edit form
router.get('/edit/:id', ensureAuthenticated ,(req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.redirect('/');
    } else {
      res.render('edit_article', {
        title: 'Edit Article',
        article: article
      });
    }
  });
});

// update Submit Post route
router.post('/edit/:id', (req, res) => {
  const article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;
  let query = { _id: req.params.id };
  Article.update(query,article, (err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      res.redirect('/');
    }
  });
});

router.delete("/:id", function (req, res) {
  if (!req.user._id) {
    res.status(500).send();
  }

  let query = { _id: req.params.id };

  Article.findById(req.params.id, function (err, article) {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, function (err) {
        if (err) {
          console.log(err);
        }
        res.send("Success");
      });
    }
  });
});

// get single article
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', {
        title: 'Article',
        article: article,
        author: user.name
      });
    });
  });
});

// Access Contorl
function ensureAuthenticated(req,res,next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}

module.exports = router;
