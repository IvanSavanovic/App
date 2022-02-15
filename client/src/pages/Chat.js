import {
    MDBBtn,
    MDBCol,
    MDBInput,
    MDBInputGroup,
    MDBListGroup,
    MDBListGroupItem,
    MDBRow,
} from "mdb-react-ui-kit";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { socket } from "../socket";

export default function Chat() {
    const sessionTokenLS = localStorage.getItem("sessionToken");
    const localMyEmail = localStorage.getItem("myEmail");
    const navigate = useNavigate();
    const [myEmail, setMyEmail] = useState("");
    const [contacts, setContacts] = useState([]);
    const [activeButton, setActiveButton] = useState("");
    const [message, setMessage] = useState("");
    const [prevMessages, setPrevMessages] = useState([]);
    const intervalRef = useRef(0);

    const setRef = useCallback((node) => {
        if (node) {
            node.scrollIntoView({ smooth: true });
        }
    }, []);

    useEffect(() => {
        if (myEmail) {
            intervalRef.current = setInterval(() => {
                socket.emit("setActive", myEmail);
            }, 3000);
        }
        return () => {
            clearInterval(intervalRef.current);
        };
    }, [myEmail]);

    useEffect(() => {
        if ((sessionTokenLS === null) | (localMyEmail === null)) {
            alert("No session token or email");
            navigate("/");
        }
        if (localMyEmail !== null) {
            setMyEmail(localMyEmail);
        }

        socket.emit("getContacts", localMyEmail);
        socket.on("getContacts", (c) => {
            setContacts(c);
        });

        socket.on("getMessages", (c) => {
            setPrevMessages(c);
        });

        socket.on("chatMessage", (msg) => {
            if (msg.from !== activeButton) {
                setPrevMessages([
                    ...prevMessages,
                    {
                        message: msg,
                        from: activeButton,
                        to: myEmail,
                    },
                ]);
            }
        });
    }, [
        localMyEmail,
        sessionTokenLS,
        navigate,
        prevMessages,
        activeButton,
        myEmail,
    ]);

    function logout() {
        localStorage.clear();
    }

    function handelSubmit(e) {
        e.preventDefault();

        socket.emit("chatMessage", message, myEmail, { to: activeButton });
        setMessage("");
        setPrevMessages([
            ...prevMessages,
            {
                message,
                from: myEmail,
                to: activeButton,
            },
        ]);
    }

    const handleMessage = (e) => {
        setMessage(e.target.value);
    };

    const renderContactsList = () => {
        let contactItems = [];
        for (let contact of contacts) {
            contactItems.push(
                <MDBListGroup flush key={contact.email}>
                    <MDBListGroupItem
                        key={contact.email}
                        action
                        active={activeButton === contact.email}
                        onClick={() => {
                            setActiveButton(contact.email);
                            socket.emit("getMessages", myEmail, contact.email);
                        }}
                    >
                        {contact.username} {contact.surname}
                    </MDBListGroupItem>
                </MDBListGroup>
            );
        }
        return contactItems;
    };

    const renderConversation = () => {
        let messageList = [];
        let i = 0;
        const lastMessage = messageList.length === i;
        for (let msg of prevMessages) {
            messageList.push(
                <MDBListGroup flush key={i} style={{}}>
                    <MDBListGroupItem
                        className={`${
                            msg.from === myEmail
                                ? "align-self-end align-items-end"
                                : "align-items-start align-self-start"
                        }`}
                        id="messages"
                        ref={lastMessage ? setRef : null}
                    >
                        <MDBListGroup
                            className={`rounded px-2 py-1 ${
                                msg.from === myEmail
                                    ? "bg-primary text-white"
                                    : "border"
                            }`}
                        >
                            {msg.message}
                        </MDBListGroup>
                    </MDBListGroupItem>
                </MDBListGroup>
            );
            i++;
        }
        return messageList;
    };

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <div className="d-flex flex-row justify-content-end border">
                <Link className="d-flex mt-1 mb-1 mx-1" to="/">
                    <MDBBtn tag="logout" onClick={logout}>Logout</MDBBtn>
                </Link>
            </div>
            <form onSubmit={handelSubmit}>
                <div className="d-flex align-items-start">
                    <div>
                        <MDBCol
                            className="d-flex-column border overflow-auto"
                            style={{ width: "20vw", height: "92.5vh" }}
                        >
                            <div>{renderContactsList()}</div>
                        </MDBCol>
                    </div>
                    <MDBCol>
                        <MDBRow
                            className="mx-1 overflow-auto"
                            style={{ height: "82.5vh" }}
                        >
                            <div>{renderConversation()}</div>
                        </MDBRow>
                        <div>
                            <MDBRow
                                className="d-flex overflow-auto"
                                style={{ height: "10vh", width: "100%" }}
                            >
                                <MDBInputGroup noWrap>
                                    <MDBInput
                                        label="Message"
                                        id="textArea"
                                        value={message}
                                        required
                                        textarea
                                        rows={2}
                                        style={{ width: "73vw" }}
                                        onChange={handleMessage}
                                    />
                                    <MDBBtn>Send</MDBBtn>
                                </MDBInputGroup>
                            </MDBRow>
                        </div>
                    </MDBCol>
                </div>
            </form>
        </div>
    );
}
