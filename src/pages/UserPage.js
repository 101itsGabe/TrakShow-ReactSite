import React, { useContext, useEffect, useState } from "react";
import {
  getUserShows,
  deleteShow,
  updateEp,
  followUser,
  unfollowUser,
  checkIfFollowing,
  getFollowingList,
  getUsername,
  getUserReviews
} from "../api/FirebaseApi";
import { useNavigate } from "react-router-dom";
import { getEps, getShow } from "../api/TVShowApi";
import "../App.css";
import { useParams, useLocation } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import {
  NavigateNextRounded,
  NavigateBeforeRounded,
  PanoramaRounded,
} from "@mui/icons-material";
import { useUser } from "../hooks/userContext";
import defaultPhoto from "../images/index.png";

export function UserPage({ userShows, setUserShows }) {
  const [shows, setShows] = useState([]); // Declare shows as a state variable
  const [finishedShows, setFinShow] = useState([]);
  const [isMyShow, setMyShow] = useState(false);
  const [pageType, setType] = useState(0);
  const [isFollowing, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followerList, setFollowerList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [pageUser, setPageUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [reviewList, setReviews] =useState([]);

  const user = useUser().user;

  const nav = useNavigate();
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    let finShow = [];
    let notFin = [];

    const fetchData = async () => {
      try {
        if (user) {
          const username = user.username;
          let curShows;
          if (shows.length === 0) {
            if (username === params.username) {
              curShows = await getUserShows(username);
              const curReviewList = await getUserReviews(user.email);
              setReviews(curReviewList);
              setMyShow(true);
            } else {
              curShows = await getUserShows(params.username);
              setMyShow(false);
              const otherUser = await getUsername(params.username);
              if (otherUser) {
                setPageUser(otherUser);
                await getUserReviews(otherUser.email);
              }
            }
          }
          //setShows(curShows); // Update shows state with fetched data

          if (curShows !== null) {
            const allEpisodes = await Promise.all(
              curShows.map(async (show) => {
                const episodes = await getEps(show.id);
                const lastEp = episodes[episodes.length - 1];
                if (
                  //show.status === "Ended" &&
                  show.curSeason === lastEp.season &&
                  show.curEp === lastEp.number
                ) {
                  finShow.push(show);
                } else {
                  notFin.push(show);
                }
                return { show, episodes };
              })
            );
          }

          setShows(notFin);
          setFinShow(finShow);
          if (pageUser != null && pageUser.email != user.email) {
            const ifFollowing = await checkIfFollowing(
              user.email,
              pageUser.email
            );
            setFollowing(ifFollowing);
          } else {
            if (followingList.length === 0) {
              const curFollow = await getFollowingList(user.email);
              if (curFollow != null && followingList.length == 0) {
                setFollowingList(curFollow);
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };
    if (user) {
      fetchData(); // Call fetchData inside useEffect
    }
  }, [user, params.username, pageUser]); // Add user.email as a dependency

  const handleType = (type) => {
    setType(type);
  };

  const followBtn = async () => {
    if (isFollowing == false) {
      await followUser(user.email, pageUser.email, pageUser.username);
    } else {
      await unfollowUser(user.email, pageUser.email);
    }
    setFollowing(!isFollowing);
  };

  const gotopage = (showID, curEpisode, curSeason) => {
    let url = "/showpage/" + showID;

    if (curEpisode) {
      url += "?param1=" + curEpisode;
    }

    if (curSeason) {
      url += "&param2=" + curSeason;
    }
    nav(url);
  };

  const gotoUser = (curUser) => {
    nav({
      pathname: "/userpage/user/" + curUser.username,
      state: { curUser },
    });
    setShows([]);
    setFinShow([]);
    setType(0);
    setLoading(true);
  };

  const removeShow = async (show) => {
    try {
      let finShow = [];
      let notFin = [];
      await deleteShow(user.email, show);
      const username = user.username;
      const curShows = await getUserShows(username);
      const allEpisodes = await Promise.all(
        curShows.map(async (show) => {
          const episodes = await getEps(show.id);
          const lastEp = episodes[episodes.length - 1];
          if (
            //show.status === "Ended" &&
            show.curSeason === lastEp.season &&
            show.curEp === lastEp.number
          ) {
            finShow.push(show);
          } else {
            notFin.push(show);
          }
          return { show, episodes };
        })
      );

      setShows(notFin);
      setFinShow(finShow);
      //setUserShows(curShows);
      //setShows(curShows); // Update shows state with fetched data
    } catch (error) {
      console.error("Error when deleting show", error);
    }
  };

  const updateCurEp = async (firebaseShow, ifUp) => {
    let finShow = [];
    let notFin = [];
    let updatedShows = [];
    try {
      const episodes = await getEps(firebaseShow.id);
      const show = await getShow(firebaseShow.id);

      if (episodes != null && show != null) {
        let curEp = firebaseShow.epIndex;
        if (ifUp) {
          if (firebaseShow.epIndex + 1 < episodes.length) {
            curEp += 1;
          }
        } else {
          if (firebaseShow.epIndex - 1 >= 0) {
            curEp -= 1;
          }
        }

        const ep = episodes[curEp];
        const newDoc = await updateEp(user, show, ep, curEp);
        const newData = newDoc.data();
        updatedShows = shows.map((show) =>
          show.id === newData.id ? newData : show
        );
        setShows(updatedShows);
      }

      const allEpisodes = await Promise.all(
        updatedShows.map(async (show) => {
          const episodes = await getEps(show.id);
          const lastEp = episodes[episodes.length - 1];
          if (
            //show.status === "Ended" &&
            show.curSeason === lastEp.season &&
            show.curEp === lastEp.number
          ) {
            finShow.push(show);
          } else {
            notFin.push(show);
          }
          return { show, episodes };
        })
      );

      setShows(notFin);
      setFinShow(finShow);
    } catch (error) {
      console.error("Something happened in updateEp", error);
    }
  };

  const curWatching = () => (
    <>
      <p className="show-count">{shows.length} Shows</p>
      <div className="Show-Scroll">
        {shows.map((item, index) => (
          <div key={index} className="show-item">
            <button
              className="Show-Scroll-Img"
              onClick={() => gotopage(item.id, item.curEp, item.curSeason)}
              style={{ borderRadius: 10 }}
            >
              <img src={item.imgUrl} alt={item.name} />
            </button>
            <div className="show-details">
              <p>{item.name}</p>
              <p>
                S{item.curSeason} | EP{item.curEp}
              </p>
              <p>{item.curEpName}</p>
            </div>
            {isMyShow && (
              <div className="show-actions">
                <div className="navigation-buttons">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCurEp(item, false);
                    }}
                    style={{ color: "black" }}
                  >
                    <NavigateBeforeRounded color="black" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCurEp(item, true);
                    }}
                    style={{ color: "black" }}
                  >
                    <NavigateNextRounded color="black" />
                  </button>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeShow(item);
                  }}
                  style={{ color: "black" }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  const curFinishedShows = () => (
    <div className="user-content">
      <div>
        {finishedShows.length !== 0 ? (
          <div>
            <p className="show-count">{finishedShows.length} Shows</p>
            <div className="Finished-Scroll">
              {finishedShows.map((item, index) => (
                <div key={index} className="show-item">
                  <button
                    className="Show-Scroll-Img"
                    onClick={() =>
                      gotopage(item.id, item.curEp, item.curSeason)
                    }
                    style={{ borderRadius: 10 }}
                  >
                    <img src={item.imgUrl} alt={item.name} />
                  </button>
                  <div className="show-details">
                    <p>{item.name}</p>
                  </div>
                  {isMyShow && (
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeShow(item);
                      }}
                      style={{ color: "black" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="no-shows-message">No finished shows to display.</p>
        )}
      </div>
    </div>
  );

  const curFollowList = () => (
    <div className="User-Container">
      <div className="User-Scroll">
        {followingList.map((item, index) => (
          <div key={index}>
            <button className="User-Btn" onClick={() => gotoUser(item)}>
              <p style={{ color: "white" }}>{item.username}</p>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (pageType) {
      case 0:
        return curWatching();
      case 1:
        return curFinishedShows();
      case 2:
        return curFollowList();
    }
  };

  return (
    <div>
      {loading ? (
        <>
          <BeatLoader color="white"></BeatLoader>
        </>
      ) : (
        <>
          <div className="user-info">
            {pageUser === null ? (
              <>
                {user.photoUrl === "" ||
                user.photoUrl === null ||
                user.photoUrl === "src/images/index.png" ? (
                  <div>
                    <img className="default-photo" src={defaultPhoto} />
                  </div>
                ) : (
                  <div>
                    <img
                      className="user-photo"
                      width={60}
                      height={60}
                      src={user.photoUrl}
                    ></img>
                  </div>
                )}
                <p>{user.username}</p>
              </>
            ) : (
              <>
                {!pageUser.photoUrl ||
                pageUser.photoUrl === "src/images/index.png" ? (
                  <div>
                    <img className="default-photo" src={defaultPhoto} />
                  </div>
                ) : (
                  <div>
                    <img
                      className="user-photo"
                      width={60}
                      height={60}
                      src={pageUser.photoUrl}
                    ></img>
                  </div>
                )}
                <p>{pageUser.username}</p>
                <button
                  className={`follow-btn ${isFollowing ? "active" : ""}`}
                  onClick={followBtn}
                >
                  {isFollowing ? "Following" : "Follow +"}
                </button>
              </>
            )}
          </div>
          <div className="Users-Btn">
            <div onClick={() => handleType(0)}>Currently Watching</div>
            <div onClick={() => handleType(1)}>Finished Shows</div>
            {user.username === params.username && (
              <>
                <div onClick={() => handleType(2)}>Follow List</div>
                <div onClick={() => handleType(3)}>Reviews</div>
              </>
            )}
          </div>
          {renderContent()}
        </>
      )}
    </div>
  );
}
