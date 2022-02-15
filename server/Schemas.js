const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    surname: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: String,
});

const sessionSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
    },
    sessionToken: {
        type: String,
        unique: true,
    },
});

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
    },
    from: {
        type: String,
    },
    to: {
        type: String,
    },
});

exports.createNewUser = async (username, surname, email, password) => {
    const User = mongoose.model("User", userSchema);
    const c = new User({
        username: username,
        surname: surname,
        email: email,
        password: password,
    });
    console.log(c);
    await c.save();
    console.log("Saved");
};

exports.getUserByEmail = async (email) => {
    const User = mongoose.model("User", userSchema);
    const getEmail = await User.find(
        { email: email },
        { _id: 0, username: 0, surname: 0, __v: 0 }
    );
    return getEmail;
};

exports.saveSessionToken = async (email, sessionToken) => {
    const Session = mongoose.model("Session", sessionSchema);
    const checkEmail = await Session.find(
        { email: email },
        { _id: 0, sessionToken: 0, __v: 0 }
    );
    if (!checkEmail.length) {
        const s = new Session({
            email: email,
            sessionToken: sessionToken,
        });
        await s.save();
        console.log("Email not in use creating new entry: ", s);
    } else {
        await Session.deleteOne({ email: email });
        const s = new Session({
            email: email,
            sessionToken: sessionToken,
        });
        await s.save();
        console.log("Deleting existing email and creating new entry: ", s);
    }
};

exports.getContacts = async (email) => {
    const User = mongoose.model("User", userSchema);
    try {
        const getContact = await User.find(
            { email: { $ne: email } },
            { _id: 0, password: 0, __v: 0 }
        );
        return getContact;
    } catch (error) {
        console.log(error);
    }
};

exports.saveMessage = async (msg, from, to) => {
    const Message = mongoose.model("Message", messageSchema);
    try {
        const c = new Message({
            message: msg,
            from: from,
            to: to,
        });
        console.log(c);
        await c.save();
        console.log("Message saved");
    } catch (error) {
        console.log("Save message failed", error);
    }
};

exports.getMessages = async (from, to) => {
    const Message = mongoose.model("Message", messageSchema);
    try {
        const getMsg = await Message.find(
            {
                $or: [
                    { $and: [{ from: from }, { to: to }] },
                    { $and: [{ from: to }, { to: from }] },
                ],
            },
            { __v: 0 }
        );
        return getMsg;
    } catch (error) {
        console.log("Failed to get messages", error);
    }
};

async function main() {
    const db = await mongoose.connect("mongodb://localhost:27017/test");
    const email = "ivan.savanovic314@gmail.com";
    const User = mongoose.model("User", userSchema);
    try {
        const getContact = await User.find(
            { email: { $ne: email } },
            { _id: 0, password: 0, __v: 0 }
        );
        console.log(getContact);
    } catch (error) {
        console.log(error);
    }
}

///main().catch((err) => console.log(err));

///module.exports.main = main;
