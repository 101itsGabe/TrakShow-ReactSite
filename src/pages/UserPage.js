import React, { useEffect, useState } from "react";
import {
  getUserShows,
  deleteShow,
  updateEp,
  followUser,
  unfollowUser,
  checkIfFollowing,
} from "../api/FirebaseApi";
import { useNavigate } from "react-router-dom";
import { getEps, getShow } from "../api/TVShowApi";
import "../App.css";
import { useParams, useLocation } from "react-router-dom";
import { BeatLoader } from 'react-spinners';
import {NavigateNextRounded, NavigateBeforeRounded} from "@mui/icons-material";

export function UserPage({ user, userShows, setUserShows }) {
  const [shows, setShows] = useState([]); // Declare shows as a state variable
  const [finishedShows, setFinShow] = useState([]);
  const [isMyShow, setMyShow] = useState(false);
  const [pageType, setType] = useState(true);
  const [isFollowing, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followerList, setFollowerList] = useState([]);
  const [followingList, setFollowingList] = useState([])

  const nav = useNavigate();
  const params = useParams();
  const location = useLocation();
  const pageUser = location.state?.user;

  useEffect(() => {
    let finShow = [];
    let notFin = [];
    const fetchData = async () => {
      try {
        const username = user.username;
        let curShows;
        if (username === params.username) {
          curShows = await getUserShows(username);
          setMyShow(true);
        } else {
          curShows = await getUserShows(params.username);
        }
        //setShows(curShows); // Update shows state with fetched data

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

        if (pageUser != null) {
          const ifFollowing = await checkIfFollowing(
            user.email,
            pageUser.email
          );
          setFollowing(ifFollowing);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchData(); // Call fetchData inside useEffect
  }, [user.email, params.username]); // Add user.email as a dependency

  const handleType = (type) => {
    setType(type);
  };

  const followBtn = async () => {
    if (isFollowing == false) {
      await followUser(user.email, pageUser.email);
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
          console.log("Last Ep")
          console.log(lastEp);
          console.log("Cur Show");
          console.log(show)
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
        if (ifUp) {
          if (firebaseShow.epIndex + 1 < episodes.length) {
            const ep = episodes[firebaseShow.epIndex + 1];
            await updateEp(user.email, show, ep, firebaseShow.epIndex + 1);
          }
        } else {
          if (firebaseShow.epIndex - 1 >= 0) {
            const ep = episodes[firebaseShow.epIndex - 1];
            await updateEp(user.email, show, ep, firebaseShow.epIndex - 1);
          }
        }
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

      //setShows(curShows); // Update shows state with fetched data
      //setUserShows(curShows);
    } catch (error) {
      console.error("Something happened in updateEp", error);
    }
  };

  return (
    <div>
      {loading ? (<><p>word is bond</p><BeatLoader color="white"></BeatLoader></>) : (<>
      <div className="Users-Btn">
        <div onClick={() => handleType(true)}>Currently Watching</div>
        <div onClick={() => handleType(false)}>Finished Shows</div>
        <div onClick={()=>{}}>Follow List</div>
      </div>
      {pageType ? (
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
          <p style={{ color: "white" }}>{shows.length} Shows</p>
          <div className="Show-Scroll">
            {shows.map((item, index) => (
              <div key={index}>
                <button
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
                        <NavigateBeforeRounded/>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCurEp(item, true);
                        }}
                      >
                        <NavigateNextRounded/>
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
      ) : (
        <div>
          <div >
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
                      <div>
                        <p>{item.name}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeShow(item);
                        }}
                      >
                        Delete
                      </button>
                    </button>
                  </div>
                ))}
              </div>
              </div>
            ) : (
              <p>No finished shows to display.</p>
            )}
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
