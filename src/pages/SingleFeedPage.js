import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { getComments, deleteComment } from "../api/FirebaseApi";
import {
  ThumbUpAlt,
  AddComment,
  ThumbUpOffAlt,
  Delete,
  WarningAmber,
  Flare
} from "@mui/icons-material";
import { AddCommentPage } from "./AddCommentPage";

export const SingleFeedPage = (user) => {
  const location = useLocation();
  const { post } = location.state;
  const [commentList, setList] = useState([]);
  const [fullPost, setPost] = useState(null);
  const [isAddComment, setAddComment] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [visiablityIndex, setVis] = useState([])

  const handleVisabilty = (index) =>{
    const newVisibility = [...visiablityIndex];
    newVisibility[index] = true;
    setVis(newVisibility);
  }


  useEffect(() => {
    const fetchComments = async () => {
      try {
        const curList = await getComments(post.id);
        const postList = curList.commentList
        const visList = postList.map(doc => doc.isSpoiler);
        setList(curList.commentList);
        //setVis(visList);
      } catch (error) {
        console.log(error.message);
      }
    };

    if (commentList.length === 0) {
      fetchComments();
    }
  }, [post.id]);

  const addCommentbtn = () => {
    setAddComment(true);
  };

  const deleteCommentBtn = async (comment) => {
    try {
      await deleteComment(post.id, comment.id);
      const newList = [];
      commentList.forEach((doc) => {
        if (doc.id != comment.id) {
          newList.push(doc);
        }
      });

      setList(newList);
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleAddComment = async (newComment) => {
    try {
      const updatedList = [...commentList, newComment];
      setList(updatedList);
    } catch (error) {
      console.log(error.message);
    }
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
          commentList.map((item, index) => {
            return(
            <div key={index}>
              {item.comment !== null ? (
                <div className="Comment-Div">
                  <div className="Comment-Item">
                    {item.isSpoiler ? (
                      <>
                        <p style={{ color: "white" }}>{item.email}</p>
                        {visiablityIndex[index] ? (
                          <>
                            <p style={{color:"white"}}>{item.comment}</p>
                          </>
                        ) : (
                          <>
                            <div className="Spoiler-Btn" onClick={() => {
                                handleVisabilty(index);
                            }}><WarningAmber/><p>Show Spoiler</p></div>
                          </>
                        )}

                        {item.email === user.user.email ? (
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
                        <p style={{ color: "white" }}>{item.email}</p>
                        <p style={{ color: "white" }}>{item.comment}</p>
                        {item.email === user.user.email ? (
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
            </div>);
          })
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
      ) : (
        <></>
      )}
    </div>
  );
};
