import React, { useState } from "react";
import { addComment } from "../api/FirebaseApi";
import { useUser } from "../hooks/userContext";

export const AddCommentPage = ({ setAddComment, post, handleAddComment }) => {
  const [comment, setComment] = useState("");
  const [hasSpoilers, setSpoilers] = useState(false);
  const user = useUser().user;

  const Replybtn = async () => {
    try {
      const newComment = await addComment(
        post.id,
        comment,
        user.email,
        hasSpoilers
      );
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
        <label htmlFor="notSpoilers">Spoiler-Free</label>
        <input
          type="radio"
          id="Spoilers"
          checked={hasSpoilers}
          onChange={() => setSpoilers(true)}
        />
        <label htmlFor="Spoilers">Contain Spoilers</label>
      </div>
      <button onClick={Replybtn} className="Reply-Btn">
        Reply
      </button>
    </div>
  );
};
