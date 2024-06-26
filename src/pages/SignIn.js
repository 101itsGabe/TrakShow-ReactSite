import React, { useState, useEffect } from "react";
import { googleSignIn, getUserShows, emailSignIn } from "../api/FirebaseApi";
import { Text, View } from "react";
import googleimg from "../images/googlelogo.jpg";
import { useNavigate,Navigate } from "react-router-dom";

export const SignIn = ({ setCurUser, setUserShow }) => {

    const [username, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const nav = useNavigate();

    const handleEmail = (e) => {
      setEmail(e.target.value);
    }

    const handlePassword = (e) =>{
      setPassword(e.target.value);
    }

    const handleSignIn = async() =>{
      try{
      const curUser = await emailSignIn(email, password);
      setCurUser(curUser);
      //console.log(curUser);
      const username = curUser.email.split("@")[0];
      const shows = await getUserShows(username);
      setUserShow(shows);
      }
      catch(error){
        console.log(error.message);
      }
    }

  const btnSignIn = async () => {
    try {
      const curUser = await googleSignIn();
      setCurUser(curUser);
      console.log(curUser);
      const username = curUser.email.split("@")[0];
      const shows = await getUserShows(username);
      setUserShow(shows);
    } catch (error) {
      console.error("Error in sign in", error);
    }
  };

  const navToSignUp = () =>{
    nav("/signuppage");
  }

  return (
    <div>
      <p style={{
        fontSize: 32,
        color: "white"
      }}>Welcome!</p>
      <div style={{ display: "inline-block" }}>
        <div style={{ display: "inline-block" }}>
          <p style={{color: "white"}}>Email</p>
          <input type="text" value={email} onChange={(e) =>{
            handleEmail(e)
          }} />
        </div>
        <div style={{ display: "inline-block" }}>
          <p style={{color: "white"}}>Password</p>
          <input type="password" value={password} onChange={(e) => {
            handlePassword(e);
          }}/>
        </div>
      </div>
      <button className="Google-Btn" style={{paddin: 10}} onClick={handleSignIn}> Sign In</button>
      <div
      style={{padding:20}}>
        <button 
        className="Google-Btn"
        style={{padding: 10}}
        onClick={btnSignIn}>
            <img src={googleimg} width={30} height={20} />
            Sign In</button>
      </div>
      <button 
            className="Google-Btn"
            onClick={navToSignUp}>Sign Up</button>
    </div>
  );
};
