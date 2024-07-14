import { useState, useEffect } from "react";
import { deleteAccount, signOutUser } from "../api/FirebaseApi";
import { useUser } from "../hooks/userContext";
import { useNavigate } from "react-router-dom";

export const DeleteConfirm = ({handleDelete}) =>{
    const user = useUser().user;
    const nav = useNavigate();


    const cancelButton = (type) => {
        handleDelete(type)
    }

    const deleteConfirm = async() => {
        try{
        nav("/");
        await deleteAccount(user.email);
        await signOutUser();
        }
        catch(error){
            console.log(error.message)
        }
    }



    return(
    <div className="Delete-Overlay">
        <button className="Delete-Overlay-button" onClick={()=>{
            cancelButton(false);
        }}>x</button>
        <p style={{color:"white"}}>Are you sure you want to delete you account?</p>
        <div style={{display: "flex", justifyContent: "center"}}>
            <button className="Google-Btn" onClick={()=>{
                cancelButton(false);
            }}>Cancel</button>
            <button className="Google-Btn" 
            onClick={()=>{
                deleteConfirm();
            }}
            style={{color: "white", backgroundColor: "red"}}>Confirm</button>
        </div>
    </div>
    )
}