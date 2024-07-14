import React, { useEffect, useState } from "react";
import { signUpUser } from "../api/FirebaseApi";
import { useNavigate, Navigate } from "react-router-dom";
import { useUser } from "../hooks/userContext";

export const SignUpPage = ({ setCurUser }) => {
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfPass] = useState("");
  const [passMatch, setPassMatch] = useState(true);
  const [isEmail, setIsEamil] = useState(true);
  const nav = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handleUserName = (e) => {
    setUsername(e.target.value);
  };
  const handlePass = (e) => {
    setPassword(e.target.value);
  };

  const handleConfPass = (e) => {
    setConfPass(e.target.value);
  };

  const navToHome = () => {
    if(passMatch && isEmail)
    nav("/");
  };

  const Register = async () => {
    console.log(password);
    console.log(confirmPass);
    if (password !== confirmPass || password.length !== 6) {
      setPassMatch(false);
    }
    if (!email.includes("@") || email === "") {
      setIsEamil(false);
    }
    if (password === confirmPass && password.length >= 6 && username !== "" && email.includes("@")) {
      try {
        const user = signUpUser(email, password, username);
        setUser(user);
        navToHome();
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  return (
    <div className="sign-up-container">
      <input
        type="text"
        value={username}
        onChange={(e) => {
          handleUserName(e);
        }}
        placeholder="Username:"
      ></input>
      <input
        type="text"
        value={email}
        onChange={(e) => {
          handleEmailChange(e);
        }}
        placeholder="Email:"
      ></input>
      <input
        type="password"
        value={password}
        placeholder="Password:"
        onChange={(e) => {
          handlePass(e);
        }}
      ></input>
      <input
        type="password"
        value={confirmPass}
        placeholder="Confirm Password:"
        onChange={(e) => {
          handleConfPass(e);
        }}
      ></input>
      {passMatch ? (
        <></>
      ) : (
        <div>
          <text style={{ color: "red" }}>Passwords do not match!</text>
          <p style={{ color: "red" }}>PassWord must have 6 letters!</p>
        </div>
      )}
      {isEmail ? (
        <></>
      ) : (
        <div>
          <p style={{ color: "red" }}>Provide an Email!</p>
        </div>
      )}
      <div style={{ padding: 30 }}>
        <button onClick={Register}>Register</button>
      </div>
    </div>
  );
};
