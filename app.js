const express = require("express");
const app = express();
const router = require("./router/router");
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

//mongo
const { MongoClient, ObjectId } = require("mongodb");
const uri = require("./atlas_uri");
const client = new MongoClient(uri);
const dbname = "messageboard";
const usersCollection = client.db(dbname).collection("users");

const connectToDatabase = async () => {
	try {
		await client.connect();
		console.log(`Connected to the ${dbname} database !!`);
	} catch (err) {
		console.error(`Error connecting to database: ${err}`);
	}
};

const main = async () => {
	try {
		await connectToDatabase();
	} catch (err) {
		console.error(`Error connecting to database: ${err}`);
	}
};

main();
//mongo

//to handle form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//

//задаю шаблонизатор ejs
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
//

//some stuff to handle authentication
app.use(
	session({
		secret: "cats",
		resave: false,
		saveUninitialized: false,
		cookie: { secure: false },
	})
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//
app.use("/", router);
app.get("/", (req, res) => {
	res.render("welcomePage");
});
//
app.get("/log-out", (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect("/");
	});
});

passport.use(
	new LocalStrategy(async (nickname, password, done) => {
		try {
			const user = await usersCollection.findOne({ nickname });

			if (!user) {
				return done(null, false, { message: "Incorrect nickname" });
			}
			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				return done(null, false, { message: "Incorrect password" });
			}
			return done(null, user);
		} catch (err) {
			return done(err);
		}
	})
);

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await usersCollection.findOne({ _id: new ObjectId(id) });

		done(null, user);
	} catch (err) {
		done(err);
	}
});

//настройка порта
const PORT = 3034;
const server = app.listen(PORT, () =>
	console.log(`Express app listening on port ${PORT}!`)
);
