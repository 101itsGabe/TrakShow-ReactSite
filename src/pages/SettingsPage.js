import { useState, useEffect } from "react";
import { useUser } from "../hooks/userContext";
import { changeUsername } from "../api/FirebaseApi";
import { DeleteConfirm } from "./DeleteAccountPopup";

export const SettingsPage = () => {
  const user = useUser().user;
  const refresh = useUser().refreshUser;
  const [chaningName, setChange] = useState(true);
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [cofirm, setConfirm] = useState(false);
  const [imageFile, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("")

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
      <input 
        type="file"
        onChange={handleFileChange}
      />
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
