const express = require("express");
const { createServer } = require("http");
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/test");
const mongo = require("./Schemas");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.static('build'))
const httpServer = createServer(app);
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

contacts ={}    

io.on("connection", async (socket) => {
    console.log("Connected");
    socket.on("setActive", email =>{
        contacts[email] = socket.id;
    })

    socket.on("login", async (email, password) => {
        try {
            let c = await mongo.getUserByEmail(email);
            console.log(c);
            if (!c.length) {
                socket.emit("login", "");
            } else {
                let isPasswordTheSame = await bcrypt.compare(
                    password,
                    c[0].password
                );
                console.log(isPasswordTheSame);
                if (isPasswordTheSame) {
                    let sessionToken = await jwt.sign(
                        { email, password },
                        "app555"
                    );
                    await mongo.saveSessionToken(email, sessionToken);
                    socket.emit("login", sessionToken);
                    contacts[email] = socket.id;
                    const c = await mongo.getContacts();
                    socket.emit("getContacts", c);
                } else {
                    socket.emit("login", "");
                }
            }
        } catch (error) {
            console.log(error);
            socket.emit("login", "");
        }
    });

    socket.on("createNewUser", async (username, surname, email, password) => {
        try {
            const hashedPassword = await bcrypt.hash(password, 8);
            await mongo.createNewUser(username, surname, email, hashedPassword);
            socket.emit("createNewUser", true);
        } catch (error) {
            console.error(error);
            socket.emit("createNewUser", false);
        }
    });

    socket.on("getContacts", async (email) => {
        contacts[email] = socket.id;
        const c = await mongo.getContacts(email);
        socket.emit("getContacts", c);
    });

    socket.on("getMessages", async (from, to) => {
        const c = await mongo.getMessages(from, to);
        console.log(c);
        socket.emit("getMessages", c)
    });

    socket.on("chatMessage", async (msg, myEmail, to) => {
        io.to(contacts[to.to])
            .emit(
                "chatMessage",
                msg,
                myEmail,
                { from: myEmail },
            );
            console.log("lol", to)
        await mongo.saveMessage(msg, myEmail, to.to);
    });
});

httpServer.listen(5000, () => {
    console.log("Listening on http://localhost:5000");
});
