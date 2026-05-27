import { useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getApiError } from "../api";

type AuthInputs = {
  email: string;
  name: string;
  password: string;
};

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<AuthInputs>({
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendRequest() {
    setError("");

    if (!inputs.email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }

    if (inputs.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (type === "signup" && inputs.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/user/${type === "signup" ? "signup" : "signin"}`, inputs);
      localStorage.setItem("token", response.data.jwt);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/blogs");
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6">
      <div className="mx-auto w-full max-w-sm">
        <div>
          <Link to="/" className="text-xl font-bold">
            Writeflow
          </Link>
          <h1 className="mt-8 text-3xl font-bold">
            {type === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {type === "signin" ? "Don't have an account?" : "Already have an account?"}
            <Link className="pl-2 font-medium underline" to={type === "signin" ? "/signup" : "/signin"}>
              {type === "signin" ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>

        <div className="pt-8">
          {type === "signup" ? (
            <LabelledInput
              label="Name"
              type="text"
              placeholder="Sahil Singh"
              value={inputs.name}
              onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
            />
          ) : null}

          <LabelledInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={inputs.email}
            onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
          />

          <LabelledInput
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={inputs.password}
            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
          />

          {error ? <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <button
            onClick={sendRequest}
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : type === "signup" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface LabelledInputType {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type: string;
}

function LabelledInput({ label, placeholder, onChange, type, value }: LabelledInputType) {
  return (
    <div>
      <label className="block pt-4 text-sm font-semibold text-stone-800">{label}</label>
      <input
        value={value}
        onChange={onChange}
        type={type}
        className="mt-2 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-sm outline-none focus:border-stone-900"
        placeholder={placeholder}
        required
      />
    </div>
  );
}
