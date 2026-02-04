import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handle = async (fn, successRedirect = "/") => {
    setMsg({ type: "", text: "" });
    try {
      await fn(email, password);
      setMsg({ type: "success", text: "Success!" });
      navigate(successRedirect);
    } catch (e) {
      setMsg({ type: "danger", text: e.message });
    }
  };

  return (
    <div className="container container-narrow">
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">Login / Register</h4>
          {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="col-md-5">
              <input
                type="password"
                className="form-control"
                placeholder="Password (min 6)"
                value={password}
                onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button className="btn btn-primary w-100" onClick={() => handle(login, "/")}>Login</button>
              <button className="btn btn-secondary w-100" onClick={() => handle(register, "/auth")}>Register</button>
            </div>
          </div>

          <p className="text-muted mt-3">
            Tip: Register first, then login. Once logged in, you can add to cart and checkout.
          </p>
        </div>
      </div>
    </div>
  );
}