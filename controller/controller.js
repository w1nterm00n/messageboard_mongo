const db = require("../db/queries");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

exports.getIndexPage = async (req, res) => {
	if (req.user) {
		try {
			const messages = await db.getAllMessages();
			res.render("messageboardPage", { user: req.user, messages: messages });
		} catch (error) {
			console.error("Error fetching messages: ", error);
			res.status(500).send("Internal Server Error");
		}
	} else {
		res.render("welcomePage");
	}
};

exports.getLogInForm = (req, res) => {
	//res.render("logInPage");
	const messages = req.flash("error");
	res.render("logInPage", { messages });
};

exports.getSignUpForm = (req, res) => {
	res.render("signUpPage");
};

exports.createUser = async (req, res, next) => {
	let name = req.body.name;
	let surname = req.body.surname;
	let nickname = req.body.nickname;
	let pwd = req.body.pwd;
	let memberPwd = req.body.memberPwd;
	let adminPwd = req.body.adminPwd;
	let hashedPassword = await bcrypt.hash(pwd, 10);
	let membership;

	//check for admin or member
	const passwords = await db.getSpecialPasswords();
	if (adminPwd == passwords[0].admin_pwd) {
		membership = "admin";
	} else if (memberPwd == passwords[0].member_pwd) {
		membership = "member";
	} else {
		membership = "non-member";
	}
	//check for admin or member

	try {
		const errors = validationResult(req);
		//if there's errors - render them in errors.ejs
		if (!errors.isEmpty()) {
			return res.render("signUpPage", {
				errors: errors.array(),
			});
		}
		await db.addUser(name, surname, nickname, hashedPassword, membership);
		return res.redirect("/logInForm?showToast=true");
	} catch (err) {
		next(err);
	}
};

exports.createMessage = async (req, res, next) => {
	let title = req.body.title;
	let message = req.body.message;
	let user_id = req.user._id;
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const messages = await db.getAllMessages();
			return res.render("messageboardPage", {
				user: req.user,
				messages: messages,
				errors: errors.array(),
			});
		}
		await db.addMessage(title, message, user_id);
		return res.redirect("/");
	} catch (err) {
		next(err);
	}
};

exports.deleteMessage = async (req, res, next) => {
	const id = new ObjectId(req.params.id_message);
	await db.deleteMessage(id);
	const messages = await db.getAllMessages();

	return res.render("messageboardPage", {
		user: req.user,
		messages: messages,
	});
};
