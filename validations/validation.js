const { body } = require("express-validator");

const alphaErr = "must only contain letters.";
const lengthErr2 = "must be at least 2 characters long";
const lengthErr6 = "must be at least 6 characters long";
const existsErr = "is required";
const matchSymbolsErr = "can only contain letters, numbers, -, _ ";

const messageValidate = [
	body("title")
		.trim()
		.exists({ checkFalsy: true })
		.withMessage(`Title ${existsErr}`)
		.isLength({ min: 2 })
		.withMessage(`Title ${lengthErr2}`)
		.escape(), // Sanitize input to prevent code injection
	body("message")
		.trim()
		.exists({ checkFalsy: true })
		.withMessage(`Message ${existsErr}`)
		.isLength({ min: 2 })
		.withMessage(`Message ${lengthErr2}`)
		.escape(),
];

const signInValidate = [
	body("name")
		.trim()
		.exists({ checkFalsy: true })
		.withMessage(`Name ${existsErr}`)
		.isAlpha()
		.withMessage(`Name ${alphaErr}`)
		.isLength({ min: 2 })
		.withMessage(`Name ${lengthErr2}`),
	body("surname")
		.trim()
		.exists({ checkFalsy: true })
		.withMessage(`Name ${existsErr}`)
		.isAlpha()
		.withMessage(`Name ${alphaErr}`)
		.isLength({ min: 2 })
		.withMessage(`Name ${lengthErr2}`),
	body("nickname")
		.trim()
		.exists({ checkFalsy: true })
		.withMessage(`Nickname ${existsErr}`)
		.isLength({ min: 2 })
		.withMessage(`Nickname ${lengthErr2}`)
		.matches(/^[a-zA-Z0-9-_]+$/)
		.withMessage(`Nickname ${matchSymbolsErr}`),
	body("pwd")
		.trim()
		.exists({ checkFalsy: true })
		.withMessage(`Password ${existsErr}`)
		.isLength({ min: 6 })
		.withMessage(`Password ${lengthErr6}`)
		.matches(/^[a-zA-Z0-9-_@]+$/)
		.withMessage(`Password ${matchSymbolsErr} and @ `),

	body("pwdRepeat")
		.trim()
		.exists({ checkFalsy: true })
		.withMessage(`Password repeat ${existsErr}`)
		.isLength({ min: 6 })
		.matches(/^[a-zA-Z0-9-_@]+$/)
		.withMessage(`Password ${matchSymbolsErr} and @ `)
		.custom((value, { req }) => {
			if (value !== req.body.pwd) {
				throw new Error("Passwords do not match");
			}
			return true;
		}),
	body("adminPwd")
		.trim()
		.optional({ checkFalsy: true })
		.matches(/^[a-zA-Z0-9-_@]+$/)
		.withMessage(`Password ${matchSymbolsErr} and @ `),

	body("memberPwd")
		.trim()
		.optional({ checkFalsy: true })
		.matches(/^[a-zA-Z0-9-_@]+$/)
		.withMessage(`Password ${matchSymbolsErr} and @ `),
];

module.exports = {
	signInValidate,
	messageValidate,
};
