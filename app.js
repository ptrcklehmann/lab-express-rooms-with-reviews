// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config")

// ℹ️ Connects to the database
require("./db")

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express")

// session configuration
// session store using mongo
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const mongoose = require('mongoose')

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs")

const app = express()

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require("./config")(app)

// default value for title local
const projectName = "express-rooms"

app.locals.title = `${projectName} ◦ ptrcklehmann`

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    saveUninitialized: false,
    //Forces the session to be saved back to the session store, 
    // even if the session was never modified during the request.
    resave: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
)
// end of session configuration

// passport configuration
const User = require('./models/User.model')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

// serialize only the `_id` field of the user to keep the information stored minimum
passport.serializeUser((user, done) => {
  done(null, user._id);
})

// when we need the information for the user, the deserializeUser function is called with the id that we previously serialized to fetch the user from the database
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(dbUser => {
      done(null, dbUser);
    })
    .catch(err => {
      done(err);
    });
})

passport.use(
  new LocalStrategy((username, password, done) => {
    // login
    User.findOne({ username: username })
      .then(userFromDB => {
        if (userFromDB === null) {
          // there is no user with this username
          done(null, false, { message: 'Wrong Credentials' });
        } else if (!bcrypt.compareSync(password, userFromDB.password)) {
          // the password is not matching
          done(null, false, { message: 'Wrong Credentials' });
        } else {
          // the userFromDB should now be logged in
          done(null, userFromDB)
        }
      })
      .catch(err => {
        console.log(err);
      })
  })
)

app.use(passport.initialize());
app.use(passport.session());


//index route
const index = require("./routes/index");
app.use("/", index);

//auth route
const auth = require("./routes/auth");
app.use("/", auth);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
