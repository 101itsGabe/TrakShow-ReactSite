import {
  useAsyncError,
  useParams,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { getShow, getSearch, getEps } from "../api/TVShowApi";
import React, { useEffect, useState } from "react";
import {
  addShow,
  deleteShow,
  getUserShows,
  isShowAdded,
  updateEp,
  addReview,
} from "../api/FirebaseApi";
import "../App.css";
import { Header } from "../pages/Header";
import { useUser } from "../hooks/userContext";
import { Star, StarBorder, StarHalf } from "@mui/icons-material";
import { BeatLoader } from "react-spinners";
import { hover } from "@testing-library/user-event/dist/hover";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

export const ShowPage = ({ setUserShows }) => {
  const [curShow, setCurShow] = useState(null); // State for current show
  const [episodes, setEpisodes] = useState([]); // State for episodes
  const [showName, setName] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  const { showID } = useParams();
  const [showDesc, setDesc] = useState("");
  const [curSeason, setSeason] = useState(0);
  const [curEp, setEp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isReviewing, setReview] = useState(false);
  const [userComment, setComment] = useState("");
  const [userRating, setRating] = useState(0.0);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const param1 = params.get("param1");
  const param2 = params.get("param2");
  const nav = useNavigate();

  const user = useUser().user;

  const handleRating = (num) => {
    setRating(num);
    console.log(num);
  };

  const CustomRating = styled(Rating)({
    "& .MuiRating-iconFilled": {
      color: "#527b90;",
    },
    "& .MuiRating-iconHover": {
      color: "#6d9fb8;",
    },
    "& .MuiRating-iconEmpty": {
      color: "white",
    },
  });

  const stripHtmlTags = (htmlString) => {
    return htmlString.replace(/<[^>]+>/g, "");
  };

  const navToReview = () => {
    nav("/reviewpage/" + curShow.id, { state: { show: curShow } });
  };

  const submitReview = async () => {
    try {
      await addReview(user, curShow, userComment, userRating);
      setReview(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const btnAddShow = async () => {
    try {
      if (user != null && curShow != null) {
        await addShow(user, curShow, episodes[0].name);
        const username = user.username;
        const shows = await getUserShows(username);
        setUserShows(shows);
        setIsAdded(true);
        setEp(1);
        setSeason(1);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (param1 && param2) {
      setEp(param1);
      setSeason(param2);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const showData = await getShow(showID);
        setCurShow(showData);
        if (user) {
          setIsAdded(await isShowAdded(user.email, showData));
          setDesc(stripHtmlTags(showData.summary));
          //console.log(showData);
        }
      } catch (error) {
        console.error("error", error);
      } finally {
        setLoading(true);
      }
    };

    if (curShow == null) {
      fetchData();
    }
  }, [curShow, user]);

  useEffect(() => {
    const fetchData = async () => {
      const episodesData = await getEps(showID);
      setEpisodes(episodesData);
    };

    if (episodes.length == 0) {
      fetchData();
    }
  }, [episodes, showID]);

  const changeEp = async (item) => {
    if (isAdded) {
      const index = episodes.findIndex(
        (ep) => item.number == ep.number && item.season == ep.season
      );
      try {
        await updateEp(user, curShow, item, index);
        setEp(item.number);
        setSeason(item.season);
        const username = user.username;
        const shows = await getUserShows(username);
        setUserShows(shows);
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  return (
    <div>
      {loading ? (
        curShow != null && (
          <>
            <div className="Show-Page">
              <div>
                <img src={curShow.image.original}></img>
                {isReviewing ? (
                  <div className="review-column">
                    <div style={{ padding: 10 }}>
                      <CustomRating
                        onChange={(event, newValue) => {
                          handleRating(newValue);
                        }}
                        value={userRating}
                        precision={0.5}
                        color="white"
                      />
                    </div>
                    <textarea
                      style={{
                        height: "150px",
                        width: "75%",
                        fontSize: "16px",
                        padding: 20,
                        margin: 10,
                      }}
                      value={userComment}
                      onChange={(e) => {
                        setComment(e.target.value);
                      }}
                    />
                    <div>
                    <button className="Google-Btn" onClick={submitReview}>
                      Submit Review
                    </button>
                    </div>
                  </div>
                ) : (
                  <div className="Show-Btn-Container">
                    <button
                      className="Google-Btn"
                      onClick={() => {
                        setReview(true);
                      }}
                    >
                      Leave Review
                    </button>
                    <button className="Google-Btn" onClick={navToReview}>See Reviews</button>
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: 20, fontWeight: "bold" }}>
                  {curShow.name}
                </p>
                <p>{curShow.status}</p>
                <p>{curShow.rating.average}/10</p>
                <p className="Show-Desc">{showDesc}</p>
                <p>Episode length: {episodes.length}</p>
                {isAdded ? <p>Choose Your Episode!</p> : <></>}

                <div className="Ep-Scroll">
                  {episodes.map((item, index) => (
                    <div
                      onClick={() => {
                        changeEp(item);
                      }}
                    >
                      <div>
                        <p>Season: {item.season}</p>
                        <p>Episode: {item.number}</p>
                        <p>{item.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {isAdded ? (
                  <div style={{ padding: 10 }}>
                    <p style={{ color: "white" }}>Season: {curSeason} </p>
                    <p style={{ color: "white" }}> Ep: {curEp}</p>
                  </div>
                ) : (
                  <button
                    onClick={btnAddShow}
                    className="Google-Btn"
                    style={{ margin: 10 }}
                  >
                    Add Show +
                  </button>
                )}
              </div>
            </div>
          </>
        )
      ) : (
        <>
          <BeatLoader color="white" />
        </>
      )}
    </div>
  );
};
