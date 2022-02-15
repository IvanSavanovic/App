import React, { useEffect, useState } from "react";
import { MDBBtn, MDBInput } from "mdb-react-ui-kit";
import { Link, useNavigate } from "react-router-dom";
import { socket } from "../socket";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        socket.on("login", (state) => {
            localStorage.setItem("sessionToken", state);
            localStorage.setItem("myEmail", email);
            if (state !== "") {
                navigate("/Chat");
                console.log("Email, password correct");
            } else {
                alert("Email, password incorrect");
                navigate("/");
            }
        });
    }, [navigate, email]);

    function handleSubmit(e) {
        e.preventDefault();
        socket.emit("login", email, password);
    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    return (
        <div className="d-flex align-items-center" style={{ height: "100vh" }}>
            <form
                onSubmit={handleSubmit}
                className="container-sm"
                style={{ width: "30vw" }}
            >
                <div className="form-outline mb-4">
                    <MDBInput
                        label="Email"
                        id="typeEmail"
                        required
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        autoComplete="username"
                    />
                </div>

                <div className="form-outline mb-4">
                    <MDBInput
                        label="Password"
                        id="typePassword"
                        required
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        autoComplete="current-password"
                    />
                </div>

                <MDBBtn>Sign in</MDBBtn>
                <div className="text-center mt-2">
                    <p>
                        Create new account? <Link to="/Register">Register</Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
