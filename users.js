import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config()

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

const dbName = "jwt_webserver_users";


await client.connect();
console.log("Client connected!");

const db = client.db(dbName);
const collection = db.collection('user_data');

const users = collection.find({}).toArray();

const findUser = async (username) => {
    return ((await users).filter(user => user.username == username))[0]
}

// Registering a User
const addUser = async (username, password) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const pushedData = await collection.insertOne({username, passwordHash});
    const _id = pushedData.insertedId.toString();
    const newUser = {_id, username, passwordHash};
    return newUser;
}

export { users, findUser, addUser };

