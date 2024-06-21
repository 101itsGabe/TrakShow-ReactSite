import { Header } from "./Header";
import { getFeed, addLike } from "../api/FirebaseApi";
import { useState, useEffect } from "react";
import likebtn from "../images/likebtn.jpg";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from 'react-spinners';
import { ThumbUpAlt, Comment, ThumbUpOffAlt } from "@mui/icons-material";
import { getDefaultNormalizer } from "@testing-library/react";
import { Navigate, useNavigate } from "react-router-dom";

export const FeedPage = ({ user }) => {
  const [feedList, setFeed] = useState([]);
  const [feedHasMore, setHasMore] = useState(true);
  const nav = useNavigate();

  const addLikeBtn = async (post) => {
    //console.log(post);
    try{
        const newPost = await addLike(user.email, post)
        console.log(newPost)
        const updatedFeedList = feedList.map((p) => 
        p.id === newPost.id ? newPost : p
      );

        setFeed(updatedFeedList);
    }catch(error){
        console.log(error.message)
    }
  }

  const navToFeed = (post) =>{
    nav("/singlefeedpage/" + post.id, { state: { post } })
  }

  const handleGetFeed = async () =>{
    try{
      if(feedList.length !== 0){
        const lastDoc = feedList[feedList.length - 1];
        const moreFeed = await getFeed(lastDoc);
        setFeed([...feedList, ...moreFeed]);
        if(moreFeed.length <= 0){
          setHasMore(false);
        }
      }
    }
    catch(error){
      console.log(error.message);
    }
  }

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const feed = await getFeed();
        //console.log(feed);
        setFeed(feed);
      } catch (error) {
        console.error("Error in feedList", error);
      }
    };

    if(feedList.length == 0){
    fetchFeed();
    }

  }, [feedList]);

  return (
    <div id="scrollableDiv" className="Feed-List">
      <InfiniteScroll
        padding={10}
        margin={5}
        dataLength={feedList.length}
        next={handleGetFeed}
        hasMore={feedHasMore}
        scrollableTarget="scrollableDiv"
        loader={
          <div>
            <BeatLoader/>
        <p style={{color: "white"}}>Hold on...</p>
        </div>
      }
        endMessage={<p style={{color: "white"}}>"I think we is done?"</p>}
      >
        {feedList.map((item, index) => {
          
          const isLiked = false
          
          return(
        <div key={index} style={{
            border: "2px solid white", 
            padding: "10px", 
            margin: "10px 0"
          }}>
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
          <p style={{color: "white"}}>{item.email}</p>
          <p style={{ color: "white" }}>
        {new Date(item.timestamp * 1000).toLocaleString()} {/* Convert timestamp to date */}
    </p>
    <div>
          <button onClick={() => {addLikeBtn(item)}}><ThumbUpOffAlt/> <p>{item.likes}</p></button>
          <button onClick={() =>{navToFeed(item)}}><Comment/></button>
          </div>
        </div>
      )})}
        </InfiniteScroll>

    </div>
  );
};
