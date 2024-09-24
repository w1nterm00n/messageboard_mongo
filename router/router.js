const { Router } = require("express");
const controller = require("../controller/controller");
const {
	signInValidate,
	messageValidate,
} = require("../validations/validation");
const router = Router();
const passport = require("passport");

router.get("/", controller.getIndexPage);

router.get("/logInForm", controller.getLogInForm);
router.get("/signUpForm", controller.getSignUpForm);

router.post("/user/create", signInValidate, controller.createUser);
router.post("/message/create", messageValidate, controller.createMessage);
router.get("/message/delete/:id_message", controller.deleteMessage);
router.post(
	"/user/auth",
	(req, res, next) => {
		next();
	},
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/logInForm",
		failureFlash: true,
	})
);

module.exports = router;
