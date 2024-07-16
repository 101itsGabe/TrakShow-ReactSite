import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getComments, deleteComment } from "../api/FirebaseApi";
import {
  ThumbUpOffAlt,
  AddComment,
  Delete,
  WarningAmber,
} from "@mui/icons-material";
import { AddCommentPage } from "./AddCommentPage";

export const SingleFeedPage = ({ user }) => {
  const location = useLocation();
  const { post } = location.state;
  const [commentList, setList] = useState([]);
  const [isAddComment, setAddComment] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const curList = await getComments(post.id);
        const visList = curList.commentList.map((doc) => doc.isSpoiler);
        console.log(curList.commentList);
        if (curList) {
          setList(curList.commentList);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (commentList.length === 0) {
      fetchComments();
    }
  }, [post]);

  const addCommentbtn = () => {
    setAddComment(true);
  };

  const deleteCommentBtn = async (comment) => {
    try {
      await deleteComment(post.id, comment.id);
      const newList = commentList.filter((doc) => doc.id !== comment.id);
      setList(newList);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleAddComment = (newComment) => {
    const updatedList = [newComment, ...commentList];
    setList(updatedList);
  };

  const handleVisibility = (curItem) => {
    const curBool = curItem.isSpoiler;
    const updatedList = commentList.map((item) => {
      if (item === curItem) {
        return { ...item, isSpoiler: !curBool };
      }

      return item;
    });
    setList(updatedList);
  };

  return (
    <div>
      <p style={{ color: "white" }}>{post.comment}</p>
      <div>
        <button>
          <ThumbUpOffAlt />
        </button>
        <button onClick={addCommentbtn}>
          <AddComment />
        </button>
      </div>
      <div className="Comment-List-Container">
        {commentList.length > 0 ? (
          commentList.map((item, index) => (
            <div key={index}>
              {item.comment !== null ? (
                <div className="Comment-Div">
                  <div className="Comment-Item">
                    {item.isSpoiler ? (
                      <>
                        <p>IS SPOILER</p>
                        <div onClick={() => {}}>
                          <p style={{ color: "white" }}>{item.email}</p>
                        </div>
                        <div>
                          <div
                            className="Spoiler-Btn"
                            onClick={() => handleVisibility(item)}
                          >
                            <WarningAmber />
                            <p style={{ color: "black" }}>Show Spoiler</p>
                          </div>
                        </div>
                        {item.email === user.email ? (
                          <button
                            className="Delete-Btn"
                            onClick={() => deleteCommentBtn(item)}
                          >
                            <Delete />
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <p>NO SPOILER</p>

                        <p style={{ color: "white" }}>{item.email}</p>
                        <p style={{ color: "white" }}>{item.comment}</p>
                        {item.email === user.email ? (
                          <button
                            className="Delete-Btn"
                            onClick={() => deleteCommentBtn(item)}
                          >
                            <Delete />
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p style={{ color: "white" }}>No Comments yet</p>
        )}
      </div>
      {isAddComment ? (
        <div className="Add-Comment-Background">
          <AddCommentPage
            setAddComment={setAddComment}
            post={post}
            handleAddComment={handleAddComment}
          />
        </div>
      ) : null}
    </div>
  );
};
