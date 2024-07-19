import { useState, useEffect } from "react";
import { useUser } from "../hooks/userContext";
import { changeUsername, uploadImage } from "../api/FirebaseApi";
import { DeleteConfirm } from "./DeleteAccountPopup";

export const SettingsPage = () => {
  const user = useUser().user;
  const refresh = useUser().refreshUser;
  const [chaningName, setChange] = useState(true);
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [cofirm, setConfirm] = useState(false);
  const [imageFile, setFile] = useState(null);
  const [ifChanged, setChanged] = useState(false);

  useEffect(() => {
    if (user != null) {
      setUserName(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleChange = (type) => {
    setChange(type);
  };
  const handleUsername = (e) => {
    setUserName(e.target.value);
  };

  const handleFileChange = async (e) => {
    setFile(e.target.files[0]);
  }

  const handleUpload = async () => {
    try{
      if(imageFile){
        const url = await uploadImage(imageFile, user);
        console.log(url);
      }
    }
    catch(error){
      console.log(error.message);
    }
    finally{
      if(imageFile){
      setChanged(true);
      }
    }
  }

  const saveUsername = async () => {
    try {
      await changeUsername(user.email, username);
    } catch (error) {
      console.log(error.message);
    } finally {
      refresh();
      window.location.reload();
    }
  };

  const handleDelete = (type) =>{
    setConfirm(type);
  }

  return (
    <div>
      <p style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
        Your Account
      </p>
      {chaningName ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: 10,
            gap: 10,
          }}
        >
          <p style={{ color: "white" }}>Username: {username}</p>
          <button
            className="Google-Btn"
            onClick={() => {
              handleChange(false);
            }}
          >
            Change Username
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: 10,
            gap: 10,
          }}
        >
          <input
            type="text"
            value={username}
            onChange={(e) => {
              handleUsername(e);
            }}
            placeholder="Username:"
          ></input>
          <button
            className="Google-Btn"
            onClick={() => {
              saveUsername();
              handleChange(true);
            }}
          >
            Save Username
          </button>
        </div>
      )}
      <p style={{ color: "white" }}>Email: {email}</p>
      <div className="change-image">
      <input 
        type="file"
        onChange={handleFileChange}
    
      ></input>
      <button className="Google-Btn"
      onClick={handleUpload}
      style={{margin: 10}}>Change Profile Picture</button>
      {ifChanged ? (<><p>Changed successfully</p></>) : (<></>)}
      </div>
      <button
        className="Google-Btn"
        style={{ backgroundColor: "red", color: "white" }}
        onClick={()=>{handleDelete(true)}}
      >
        Delete Account
      </button>
      {cofirm ? <div className="Add-Comment-Background">
      <DeleteConfirm handleDelete={handleDelete}/></div> : <></>}
    </div>
  );
};
