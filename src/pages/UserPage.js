import React, { useEffect, useState } from "react";
import {
  getUserShows,
  deleteShow,
  updateEp,
  followUser,
  unfollowUser,
  checkIfFollowing,
  getFollowingList,
} from "../api/FirebaseApi";
import { useNavigate } from "react-router-dom";
import { getEps, getShow } from "../api/TVShowApi";
import "../App.css";
import { useParams, useLocation } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import {
  NavigateNextRounded,
  NavigateBeforeRounded,
} from "@mui/icons-material";

import { useCurAuth } from "../hooks/useAuth";

export function UserPage({ user, userShows, setUserShows }) {
  const [shows, setShows] = useState([]); // Declare shows as a state variable
  const [finishedShows, setFinShow] = useState([]);
  const [isMyShow, setMyShow] = useState(false);
  const [pageType, setType] = useState(0);
  const [isFollowing, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followerList, setFollowerList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const { authUser, authLoading } = useCurAuth();

  const nav = useNavigate();
  const params = useParams();
  const location = useLocation();
  const pageUser = location.state?.user;

  useEffect(() => {
    let finShow = [];
    let notFin = [];

    console.log("HELLO");

    if (!authLoading) {
      if (!authUser) {
        console.log("rip buddy your guy is null");
      } else {
        console.log("maybe not");
      }
    }

    const fetchData = async () => {
      try {
        const username = user.username;
        let curShows;
        if (shows.length === 0) {
          if (username === params.username) {
            curShows = await getUserShows(username);
            setMyShow(true);
          } else {
            curShows = await getUserShows(params.username);
            setMyShow(false);
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
        }

        if (followingList.length === 0) {
          const curFollow = await getFollowingList(user.email);
          if (curFollow != null && followingList.length == 0) {
            setFollowingList(curFollow);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    console.log("calling fetch");
    fetchData(); // Call fetchData inside useEffect
  }, [authUser, authLoading]); // Add user.email as a dependency

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
    nav("/userpage/user/" + curUser.username, { state: { curUser } });
    shows.length = 0;
    setType(0);
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
        await updateEp(user.email, show, ep, curEp);
      }
      // Now fetch the updated user shows
      const curShows = await getUserShows(user.username);

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
    } catch (error) {
      console.error("Something happened in updateEp", error);
    }
  };

  const curWatching = () => (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {isMyShow ? null : (
          <div style={{ display: "flex", alignItems: "center" }}>
            <p style={{ color: "white", margin: 10 }}>{params.username}</p>
            {isFollowing ? (
              <button className="follow-btn active" onClick={followBtn}>
                Following
              </button>
            ) : (
              <button className="follow-btn" onClick={followBtn}>
                Follow +
              </button>
            )}
          </div>
        )}
      </div>
      <p style={{ color: "white", fontWeight: "bold" }}>{shows.length} Shows</p>
      <div className="Show-Scroll">
        {shows.map((item, index) => (
          <div key={index}>
            <button
              className="Show-Scroll-Img"
              onClick={() => gotopage(item.id, item.curEp, item.curSeason)}
            >
              <img src={item.imgUrl} alt={item.name} />
            </button>
            <div>
              <p>{item.name}</p>
            </div>
            <div>
              <p>
                S{item.curSeason} | EP{item.curEp}{" "}
              </p>
              <p>{item.curEpName}</p>
            </div>
            {isMyShow && (
              <div>
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCurEp(item, false);
                    }}
                  >
                    <NavigateBeforeRounded />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCurEp(item, true);
                    }}
                  >
                    <NavigateNextRounded />
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeShow(item);
                  }}
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
    <div>
      <div>
        {finishedShows.length !== 0 ? (
          <div>
            <p style={{ color: "white" }}>{finishedShows.length} Shows</p>
            <div className="Finished-Scroll">
              {finishedShows.map((item, index) => (
                <div key={index}>
                  <button
                    onClick={() =>
                      gotopage(item.id, item.curEp, item.curSeason)
                    }
                  >
                    <img src={item.imgUrl} alt={item.name} />
                  </button>
                  <div>
                    <p>{item.name}</p>
                  </div>
                  {isMyShow && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeShow(item);
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ color: "white", fontSize: 16 }}>
            No finished shows to display.
          </p>
        )}
      </div>
    </div>
  );

  const curFollowList = () => (
    <div>
      {followingList.map((item, index) => (
        <div key={index}>
          <button className="User-Btn" onClick={() => gotoUser(item)}>
            <p style={{ color: "white" }}>{item.username}</p>
          </button>
        </div>
      ))}
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
          <div className="Users-Btn">
            <div onClick={() => handleType(0)}>Currently Watching</div>
            <div onClick={() => handleType(1)}>Finished Shows</div>
            {user.username === params.username && (
              <>
                <div onClick={() => handleType(2)}>Follow List</div>
              </>
            )}
          </div>
          {renderContent()}
        </>
      )}
    </div>
  );
}
