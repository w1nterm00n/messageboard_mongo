const { MongoClient } = require("mongodb");
const uri = require("../atlas_uri");
const { ObjectId } = require("mongodb");
const client = new MongoClient(uri);
const dbname = "messageboard";
const usersCollection = client.db(dbname).collection("users");
const messagesCollection = client.db(dbname).collection("messages");
const pwdCollection = client.db(dbname).collection("special_passwords");

const getAllMessages = async () => {
	try {
		let result = await messagesCollection
			.aggregate([
				{
					$lookup: {
						from: "users", // имя коллекции для объединения
						localField: "user_id", // поле из messages
						foreignField: "_id", // поле из users
						as: "user_info", // имя поля для объединённых данных
					},
				},
				{
					$unwind: "$user_info", // развернуть массив user_info
				},
				{
					$project: {
						title: 1,
						date: 1,
						text: 1,
						nickname: "$user_info.nickname", // вывод никнейма
					},
				},
			])
			.toArray();

		return result;
	} catch (err) {
		console.error(`Error getting all messages: ${err}`);
	}
};

async function getSpecialPasswords() {
	const passwords = await pwdCollection.find().toArray();
	return passwords;
}

async function addUser(name, surname, nickname, pwd, membership) {
	try {
		await usersCollection.insertOne({
			name: name,
			surname: surname,
			nickname: nickname,
			password: pwd,
			membership: membership,
		});
	} catch (err) {
		console.error(`Error adding user: ${err}`);
	}
}

async function addMessage(title, message, user_id) {
	try {
		await messagesCollection.insertOne({
			title: title,
			date: new Date(),
			text: message,
			user_id: user_id,
		});
	} catch (err) {
		console.error(`Error adding message: ${err}`);
	}
}

async function deleteMessage(id_message) {
	await messagesCollection.deleteOne({ _id: id_message });
}

module.exports = {
	getAllMessages,
	addUser,
	addMessage,
	deleteMessage,
	getSpecialPasswords,
};
