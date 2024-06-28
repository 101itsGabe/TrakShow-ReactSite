import React, { useState, useEffect } from "react";
import { addComment } from "../api/FirebaseApi";

export const AddCommentPage = ({ user, setAddComment, post, handleAddComment }) => {
  const [comment, setComment] = useState("");
  const [hasSpoilers, setSpoilers] = useState(false);

  const Replybtn = async () => {
    try {
      const newComment = await addComment(post.id, comment, user.email, hasSpoilers);
      handleAddComment(newComment);
      setAddComment(false);
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="Add-Comment-Overlay">
      <button
        className="Add-Comment-Overlay-btn"
        onClick={() => {
          setAddComment(false);
        }}
      >
        <i className="fas fa-times"></i>
      </button>
      <textarea
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
        }}
        placeholder="Add Your Comment"
        required
      />
      <div className="radio-btn">
        <input
          type="radio"
          id="notSpoilers"
          checked={!hasSpoilers}
          onChange={() => setSpoilers(false)}
        />
        <label style={{color: "white"}}for="notSpoilers">Spoiler-Free</label>
        <input
          type="radio"
          id="Spoilers"
          checked={hasSpoilers}
          onChange={() => setSpoilers(true)}
        />
        <label style={{color: "white"}}for="notSpoilers">Contain Spoilers</label>
      </div>

      <button onClick={Replybtn}className="Reply-Btn">Reply</button>
    </div>
  );
};
