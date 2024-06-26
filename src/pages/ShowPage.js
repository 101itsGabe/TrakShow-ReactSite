import { useAsyncError, useParams, useLocation } from "react-router-dom";
import { getShow, getSearch, getEps } from "../api/TVShowApi";
import React, { useEffect, useState } from "react";
import { addShow, deleteShow, getUserShows, isShowAdded, updateEp } from "../api/FirebaseApi";
import "../App.css";
import {Header} from "../pages/Header";

export const ShowPage = ({ user, setUserShows }) => {
  const [Show, setShow] = useState(null);
  const [curShow, setCurShow] = useState(null); // State for current show
  const [episodes, setEpisodes] = useState([]); // State for episodes
  const [showName, setName] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  const { showID } = useParams();
  const [showDesc, setDesc] = useState("");
  const [curSeason, setSeason] = useState(0);
  const [curEp, setEp] = useState(0);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const param1 = params.get("param1");
  const param2 = params.get("param2");

  const stripHtmlTags = (htmlString) => {
    return htmlString.replace(/<[^>]+>/g, "");
  };

  const btnAddShow = async () => {
    try {
      if (user != null && curShow != null) {
        await addShow(user.email, curShow, episodes[0].name);
        const username = user.username
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
        setIsAdded(await isShowAdded(user.email, showData));
        setDesc(stripHtmlTags(showData.summary));
        //console.log(showData);
      } catch (error) {
        console.error("error", error);
      }
    };

    if (curShow == null) {
      fetchData();
    }
  }, [curShow]);

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
    console.log("hehe?")
    if (isAdded) {
      const index = episodes.findIndex(
        (ep) => item.number == ep.number && item.season == ep.season
      );
      try{
      await updateEp(user.email, curShow, item, index);
      setEp(item.number);
      setSeason(item.season);
      const username = user.username
      const shows = await getUserShows(username);
      setUserShows(shows);
      }catch(error){
        console.log(error.message);
      }
    }
  };

  return (
    <div>
      {curShow != null && (
        <>
          <div className="Show-Page">
            <img src={curShow.image.original}></img>
            <div>
              <p style={{fontSize: 20, fontWeight: "bold"}}>{curShow.name}</p>
              <p >{curShow.status}</p>
              <p >{curShow.rating.average}/10</p>
              <p className="Show-Desc" >{showDesc}</p>
              <p >Episode length: {episodes.length}</p>

          <div class="Ep-Scroll">
            {episodes.map((item, index) => (

                <div
                  onClick={() => {
                    changeEp(item);
                  }}
                  
                >
                  <div>
                    <p>
                      Season: {item.season}
                    </p>
                    <p>
                      Episode: {item.number}
                    </p>
                    <p>{item.name}</p>
                  </div>
                </div>
            ))}
          </div>
          {isAdded ? (
            <div style={{padding: 10}}>
              <p style={{color: "white"}}>Season: {curSeason} </p>
              <p style={{color: "white"}}> Ep: {curEp}</p>
            </div>
          ) : (
            <button onClick={btnAddShow} className="header-btn">Add Show +</button>
          )}
          </div>
          </div>
        </>
      )}
    </div>
  );
};
