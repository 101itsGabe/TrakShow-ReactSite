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

  const addLikeBtn = async (post) => {
    //console.log(post);
    try {
      if (feedType) {
        const newPost = await addLike(user.email, post);
        const updatedFeedList = feedList.map((p) =>
          p.id === newPost.id ? newPost : p
        );

        setFeed(updatedFeedList);
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
    nav("/singlefeedpage/" + post.id, { state: { post } });
  };

  const handleType = (type) => {
    setType(type);
  };

  const handleGetFeed = async () => {
    try {
      if (feedType) {
        if (feedList.length !== 0) {
          const lastDoc = feedList[feedList.length - 1];
          const moreFeed = await getFeed(lastDoc, false, user.email);
          setFeed([...feedList, ...moreFeed]);
          if (moreFeed.length < 5 || moreFeed === null) {
            setHasMore(false);
          }
        }
      } else {
        if (followingFeed.length !== 0) {
          const lastDoc = followingFeed[followingFeed.length - 1];
          const moreFeed = await getFeed(lastDoc, true, user.email, followingList);
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
          const feed = await getFeed(null, true, user.email, curFollowingList);
          if (feed.length < 5 && pulled === false) {
            setFollowingMore(false);
          }
          setFollowingFeed(feed);
        }
        if (feedList.length === 0 && pulled === false) {
          const fullFeed = await getFeed(null, false, user.email);
          if (fullFeed < 5) {
            setHasMore(false);
          }
          setFeed(fullFeed);
          setPulled(true);
        }
      } catch (error) {
        console.error("Error in feedList", error);
      }
    };

    if (pulled === false && user) {
      console.log("geeting Feed");
      fetchFeed();
    }
  }, [feedList, user]);

  return (
    <div>
      <div className="Users-Btn">
        <div onClick={() => handleType(false)}>Following</div>
        <div onClick={() => handleType(true)}>All Feed</div>
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
                  <BeatLoader style={{ color: "white" }} />
                  <p style={{ color: "white" }}>Hold on...</p>
                </div>
              }
              endMessage={
                <p style={{ color: "white" }}>"I think we is done?"</p>
              }
            >
              {followingFeed.map((item, index) => {
                const isLiked = false;

                return (
                  <div
                    key={index}
                    style={{
                      border: "2px solid white",
                      padding: "10px",
                      margin: "10px 0",
                    }}
                  >
                    <p
                      style={{
                        color: "white",
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        maxWidth: "100%",
                      }}
                    >
                      {item.comment}
                    </p>
                    <p style={{ color: "white" }}>{item.email}</p>

                    <div>
                      <button
                        onClick={() => {
                          addLikeBtn(item);
                        }}
                      >
                        <ThumbUpOffAlt /> <p>{item.likes}</p>
                      </button>
                      <button
                        onClick={() => {
                          navToFeed(item);
                        }}
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
                  <BeatLoader style={{ color: "white" }} />
                  <p style={{ color: "white" }}>Hold on...</p>
                </div>
              }
              endMessage={
                <p style={{ color: "white" }}>"I think we is done?"</p>
              }
            >
              {feedList.map((item, index) => {
                const isLiked = false;

                return (
                  <div
                    key={index}
                    style={{
                      border: "2px solid white",
                      padding: "10px",
                      margin: "10px 0",
                    }}
                  >
                    <p
                      style={{
                        color: "white",
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        maxWidth: "100%",
                      }}
                    >
                      {item.comment}
                    </p>
                    <p style={{ color: "white" }}>{item.email}</p>

                    <div>
                      <button
                        onClick={() => {
                          addLikeBtn(item);
                        }}
                      >
                        <ThumbUpOffAlt /> <p>{item.likes}</p>
                      </button>
                      <button
                        onClick={() => {
                          navToFeed(item);
                        }}
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
