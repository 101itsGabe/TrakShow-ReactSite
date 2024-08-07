import { Header } from "./Header";
import { getFeed, addLike, getFollowingList } from "../api/FirebaseApi";
import { useState, useEffect } from "react";
import likebtn from "../images/likebtn.jpg";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import { ThumbUpAlt, Comment, ThumbUpOffAlt } from "@mui/icons-material";
import { getDefaultNormalizer } from "@testing-library/react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/userContext";
import defaultPhoto from "../images/index.png";

export const FeedPage = () => {
  const [followingFeed, setFollowingFeed] = useState([]);
  const [feedList, setFeed] = useState([]);
  const [feedHasMore, setHasMore] = useState(true);
  const [followingHasMore, setFollowingMore] = useState(true);
  const [followingList, setFollowingList] = useState([]);
  const [feedType, setType] = useState(false);
  const [pulled, setPulled] = useState(false);
  const nav = useNavigate();
  const user = useUser().user;

  const addLikeBtn = async (fullPost) => {
    const post = fullPost.post;
    try {
      if (feedType) {
        const newPost = await addLike(user.email, post);
        let newFullPost = {
          ...fullPost,
          post: newPost,
          liked: !fullPost.liked,
        };
        if (newFullPost) {
          const updatedFeedList = feedList.map((p) =>
            p.post.id === newFullPost.post.id ? newFullPost : p
          );

          setFeed(updatedFeedList);
        }
      } else {
        const newPost = await addLike(user.email, post);
        const updatedFeedList = followingFeed.map((p) =>
          p.id === newPost.id ? newPost : p
        );

        setFollowingFeed(updatedFeedList);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const navToFeed = (post) => {
    const curPost = post.post;
    nav("/singlefeedpage/" + curPost.id, { state: { post: post } });
  };

  const navToUser = (username) => {
    nav("/userpage/user/" + username);
  };

  const handleType = (type) => {
    setType(type);
  };

  const handleGetFeed = async () => {
    //console.log("getting feed");
    try {
      if (feedType) {
        if (feedList.length !== 0) {
          const lastDoc = feedList[feedList.length - 1];
          const moreFeed = await getFeed(lastDoc.post, false, user);
          setFeed([...feedList, ...moreFeed]);
          if (moreFeed.length < 5 || moreFeed === null) {
            //console.log("LESS THAN 5");
            setHasMore(false);
          }
        }
      } else {
        if (followingFeed.length !== 0) {
          const lastDoc = followingFeed[followingFeed.length - 1];
          const moreFeed = await getFeed(
            lastDoc.post,
            true,
            user,
            followingList
          );
          setFollowingFeed([...followingFeed, ...moreFeed]);
          if (moreFeed.length < 5) {
            setFollowingMore(false);
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        if (followingFeed.length === 0) {
          const curFollowingList = await getFollowingList(user.email);
          setFollowingList(curFollowingList);
          const feed = await getFeed(null, true, user, curFollowingList);
          if (feed.length < 5 && pulled === false) {
            setFollowingMore(false);
          }
          setFollowingFeed(feed);
        }
        if (feedList.length === 0 && pulled === false) {
          const fullFeed = await getFeed(null, false, user);
          if (fullFeed.length < 5 && pulled === false) {
            setHasMore(false);
          }

          //console.log(feedHasMore);
          setFeed(fullFeed);
          setPulled(true);
        }
      } catch (error) {
        console.error("Error in feedList", error);
      }
    };

    if (pulled === false && user) {
      fetchFeed();
    }
  }, [feedList, user]);

  return (
    <div className="feed-container">
      <div className="Users-Btn">
        <div onClick={() => handleType(false)} >
          Following
        </div>
        <div onClick={() => handleType(true)}>
          All Feed
        </div>
      </div>
      <div id="scrollableDiv" className="Feed-List">
        {!feedType ? (
          <>
            <InfiniteScroll
              padding={10}
              margin={5}
              dataLength={followingFeed.length}
              next={handleGetFeed}
              hasMore={followingHasMore}
              scrollableTarget="scrollableDiv"
              loader={
                <div>
                  <BeatLoader color="white" />
                  <p style={{ color: "white" }}>Loading...</p>
                </div>
              }
              endMessage={<p style={{ color: "white" }}>"Finished Feed"</p>}
            >
              {followingFeed.map((item, index) => {
                //const isLiked = false;
                return (
                  <div key={index} className="feed-item">
                    <div className="user-info"
                    onClick={() => {
                      navToUser(item.post.username);
                    }}>

                      {!item.post.photoUrl||
                      item.post.photoUrl === "src/images/index.png" ? (
                        <>
                        <img src={defaultPhoto}
                         className="avatar"></img>
                        <p>{item.post.username}</p>
                        </>
                        
                      ) : (
                        <>
                      <img
                        src={item.post.photoUrl}
                        alt="User Avatar"
                        className="avatar"
                      />
                      <p>{item.post.username}</p>
                    </>
                    
                      )}
                    </div>
                    <p className="comment">{item.post.comment}</p>
                    <div className="actions">
                      <button
                        onClick={() => addLikeBtn(item)}
                        className="action-button"
                      >
                        {item.liked ? <ThumbUpAlt /> : <ThumbUpOffAlt />}
                        <p>{item.post.likes}</p>
                      </button>
                      <button
                        onClick={() => navToFeed(item)}
                        className="action-button"
                      >
                        <Comment />
                      </button>
                    </div>
                  </div>
                );
              })}
            </InfiniteScroll>
          </>
        ) : (
          <>
            <InfiniteScroll
              padding={10}
              margin={5}
              dataLength={feedList.length}
              next={handleGetFeed}
              hasMore={feedHasMore}
              scrollableTarget="scrollableDiv"
              loader={
                <div>
                  <BeatLoader color="" />
                  <p style={{ color: "white" }}>Loading...</p>
                </div>
              }
              endMessage={<p style={{ color: "white" }}>"Finished Feed"</p>}
            >
              {feedList.map((item, index) => {
                const isLiked = false;

                return (
                  <div key={index} className="feed-item">
                    <div className="user-info"
                    onClick={() => {
                      navToUser(item.post.username);
                    }}>
                    {!item.post.photoUrl||
                      item.post.photoUrl === "src/images/index.png" ? (
                        <>
                        <img src={defaultPhoto}
                         className="avatar"></img>
                        <p>{item.post.username}</p>
                        </>
                        
                      ) : (
                        <>
                      <img
                        src={item.post.photoUrl}
                        alt="User Avatar"
                        className="avatar"
                      />
                      <p>{item.post.username}</p>
                    </>
                    
                      )}
                    </div>
                    <p className="comment">{item.post.comment}</p>
                    <div className="actions">
                      <button
                        onClick={() => addLikeBtn(item)}
                        className="action-button"
                      >
                        {item.liked ? <ThumbUpAlt /> : <ThumbUpOffAlt />}
                        <p>{item.post.likes}</p>
                      </button>
                      <button
                        onClick={() => navToFeed(item)}
                        className="action-button"
                      >
                        <Comment />
                      </button>
                    </div>
                  </div>
                );
              })}
            </InfiniteScroll>
          </>
        )}
      </div>
    </div>
  );
};
