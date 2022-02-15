import React, { useEffect, useState } from "react";
import { MDBBtn, MDBInput } from "mdb-react-ui-kit";
import { Link, useNavigate } from "react-router-dom";
import { socket } from "../socket";

export default function Register() {
    const [username, setUsername] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        socket.on("createNewUser", (status) => {
            if (status) {
                console.log("Account registered");
                navigate("/");
            } else {
                alert("Email is already in use");
                navigate("/Register");
            }
        });
    }, [navigate]);

    function handleSubmit(e) {
        e.preventDefault();
        socket.emit("createNewUser", username, surname, email, password);
        console.log("Submit");
    }
    const handleNameChange = (e) => {
        setUsername(e.target.value);
    };

    const handleSurnameChange = (e) => {
        setSurname(e.target.value);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    return (
        <div className="d-flex align-items-center mt-3 ms-2" style={{ width: "100%", height: "100%" }}>
            <form onSubmit={handleSubmit}>
                <div className="row mb-4">
                    <div className="col form-outline">
                        <MDBInput
                            type="text"
                            label="First name"
                            id="firstName"
                            value={username}
                            required
                            onChange={handleNameChange}
                        />
                    </div>
                    <div className="col form-outline">
                        <MDBInput
                            label="Last name"
                            type="text"
                            id="lastName"
                            value={surname}
                            required
                            onChange={handleSurnameChange}
                        />
                    </div>
                </div>

                <div className="form-outline mb-4">
                    <MDBInput
                        label="Email address"
                        type="email"
                        id="emailAddress"
                        value={email}
                        required
                        onChange={handleEmailChange}
                        autoComplete="username"
                    />
                </div>

                <div className="form-outline mb-4">
                    <MDBInput
                        label="Password"
                        type="password"
                        id="typePassword"
                        value={password}
                        required
                        onChange={handlePasswordChange}
                        autoComplete="current-password"
                    />
                </div>

                <MDBBtn>Sign up</MDBBtn>

                <Link className="ms-1" to="/">
                    <MDBBtn>Back</MDBBtn>
                </Link>
            </form>
        </div>
    );
}
