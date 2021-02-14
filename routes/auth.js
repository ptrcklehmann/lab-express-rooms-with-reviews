const router = require("express").Router();

/* GET home page */
router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

/* GET signup page */
router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

module.exports = router;
