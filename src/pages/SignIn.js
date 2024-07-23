import React, { useState, useEffect } from "react";
import { googleSignIn, getUserShows, emailSignIn } from "../api/FirebaseApi";
import { Text, View } from "react";
import googleimg from "../images/googlelogo.jpg";
import { useNavigate, Navigate } from "react-router-dom";
import logo from "../images/logo.png";
import { useUser } from "../hooks/userContext";

export const SignIn = ({ setUserShow }) => {
  const { setUser } = useUser();
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSignIn = async () => {
    try {
      const curUser = await emailSignIn(email, password);
      console.log(curUser);
      setUser(curUser);
      const username = curUser.email.split("@")[0];
      const shows = await getUserShows(username);
      setUserShow(shows);
    } catch (error) {
      console.log(error.message);
    }
  };

  const btnSignIn = async () => {
    try {
      const curUser = await googleSignIn();
      setUser(curUser);
      console.log(curUser);
      const username = curUser.email.split("@")[0];
      const shows = await getUserShows(username);
      setUserShow(shows);
    } catch (error) {
      console.error("Error in sign in", error);
    }
  };

  const navToSignUp = () => {
    nav("/signuppage");
  };

  return (
    <div className="sign-in">
      <img src={logo} style={{ padding: 30 }}></img>
      <p
        style={{
          fontSize: 32,
          color: "white",
          fontWeight: "bold",
        }}
      >
        Welcome!
      </p>
      <div className="sign-in-input">
        <div>
          <p style={{ color: "white", fontWeight: "bold" }}>Email</p>
          <input
            type="text"
            value={email}
            onChange={(e) => {
              handleEmail(e);
            }}
            placeholder="Email"
          />
        </div>
        <div>
          <p style={{ color: "white", fontWeight: "bold" }}>Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              handlePassword(e);
            }}
            placeholder="Password"
          />
        </div>
      </div>
      <button
        className="Google-Btn"
        style={{ paddin: 10 }}
        onClick={handleSignIn}
      >
        {" "}
        Sign In
      </button>
      <div style={{ padding: 20 }}>
        <button className="Google-Btn" onClick={btnSignIn}>
          <img
            src={googleimg}
            width={40}
            height={25}
            style={{ marginRight: 10, borderRadius: 10 }}
          />
          Sign In
        </button>
      </div>
      <button className="Google-Btn" onClick={navToSignUp}>
        Sign Up
      </button>
    </div>
  );
};
