import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

function App() {
    return (
        <Router className="App">
            <Routes>
                <Route path="/" element={<Login />} exact />
                <Route path="/Register" element={<Register />} />
                <Route path="/Chat" element={<Chat />} />
                <Route element={Error} />
            </Routes>
        </Router>
    );
}

export default App;
