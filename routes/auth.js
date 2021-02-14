const router = require("express").Router();
const User = require('../models/User.model')
const bcrypt = require('bcrypt');
const passport = require('passport');

// check if user is logged in before creating a new account
const reverseloginCheck = () => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/');
    }
  }
}

/* GET login page */
router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

/* GET signup page */
router.get("/signup", reverseloginCheck(), (req, res, next) => {
  res.render("auth/signup");
});

/* POST login page */
router.post('/login', 
    passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/login' 
  }));



/* POST signup page */
router.post('/signup', (req, res, next) => {
  const { email, password, fullName } = req.body;
  if (password.length < 8) {
    res.render('auth/signup', {
      message: 'Your password must be 8 characters minimun.'
    });
    return;
  }
  if (email === '') {
    res.render('auth/signup', { message: 'Your username cannot be empty' });
    return;
  }
  User.findOne({ email: email }).then(found => {
    if (found !== null) {
      res.render('auth/signup', { message: 'This username is already taken' });
    } else {
      // we can create a user with the username and password pair
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(password, salt);

      User.create({ email: email, password: hash, fullName: fullName })
        .then(dbUser => {
          // login with passport 
          req.login(dbUser, err => {
            if (err) {
              next(err);
            } else {
              res.redirect('/');
            }
          })
        })
        .catch(err => {
          next(err);
        });
    }
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

module.exports = router;
