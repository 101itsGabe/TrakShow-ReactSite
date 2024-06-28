import { Navigate, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import TVShowApi, { getSearch } from "../api/TVShowApi";
import { getUsers } from "../api/FirebaseApi";
import { Header } from "../pages/Header";
import "../App.css";
import { setLogLevel } from "firebase/app";
import {
  SearchTwoTone,
  NavigateNextRounded,
  NavigateBeforeRounded,
} from "@mui/icons-material";

export const SearchPage = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState(""); // State for the search term
  const [searchResults, setSearchResults] = useState([]); // State to store search results
  const [recResult, setRec] = useState([]);
  const [typeSearch, setType] = useState(true);
  const [showBtn, setShowBtn] = useState(true);
  const [userList, setList] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [curPage, setPage] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    if (user === null) {
      nav("/");
    }
  });

  const handleSearch = async (s) => {
    try {
      console.log(curPage);
      const results = await getSearch(s, curPage);

      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleNextPage = async (type) => {
    let pageNum;
    try {
      if (type) {
        pageNum = curPage + 1;
      } else {
        if (curPage - 1 >= 0) {
          pageNum = curPage - 1;
        }
      }
      setPage(pageNum);

      window.scrollTo({ top: 0, behavior: "smooth" });
      const results = await getSearch("", pageNum);
      setSearchResults(results);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleType = (type) => {
    setType(type);
  };

  const gotopage = (showID) => {
    nav("/showpage/" + showID);
  };

  const gotoUser = (user) => {
    nav("/userpage/user/" + user.username, { state: { user } });
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      try {
        await handleSearch(event.target.value);
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  const handleDropChange = (event) => {
    setSelectedOption(event.target.value);
    let newList = [];
    searchResults.forEach((show) => {
      show.genres.forEach((genre) => {
        if (genre == event.target.value) {
          newList.push(show);
        }
      });
    });
    console.log(newList);
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const results = await getSearch("", curPage);
        const userRes = await getUsers();
        setSearchResults(results);
        setList(userRes);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchRecommendations();
  }, []); // Empty dependency array means this effect runs once on component mount

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search show name..."
        className="search-bar"
      />

      <div className="header-btn">
        <button onClick={() => handleType(true)}>Shows</button>
        <button onClick={() => handleType(false)}>Users</button>
      </div>

{/*
      <select id="dropdown" value={selectedOption} onChange={handleDropChange}>
        <option value="">Select</option>
        <option value="Action">Action</option>
        <option value="Adult">Adult</option>
        <option value="Adeventure">Adeventure</option>
        <option value="Anime">Anime</option>
        <option value="Comedy">Comedy</option>
        <option value="Comedy">Comedy</option>
        <option value="Drama">Drama</option>
      </select>
      */}

      
        {typeSearch ? (
        <div className="Search-Scroll">
          {searchResults.map((item, index) => (
            <div key={index}>
              <button onClick={() => gotopage(item.id || item.show.id)}>
                {item.image && item.image.medium ? (
                  <img src={item.image.medium} alt={item.name || "Image"} />
                ) : item.show && item.show.image && item.show.image.medium ? (
                  <img
                    src={item.show.image.medium}
                    alt={item.show.name || "Image"}
                  />
                ) : (
                  <span>No Image Available</span>
                )}
              </button>
              <p style={{ color: "white" }}> {item.name || item.show.name}</p>
            </div>
          ))}
          </div>
        ) : (
          <div className="User-Container">
            <div className="User-Scroll">
              {userList.map((item, index) => (
                <div key={index}>
                  <button className="User-Btn" onClick={() => gotoUser(item)}>
                    <p style={{ color: "white" }}>{item.username}</p>
                  </button>
                </div>
              ))}
            </div>
            </div>
        )}
      {typeSearch ? (
        <>
          <div style={{ padding: 15 }}>
            <button
              onClick={() => {
                handleNextPage(false);
              }}
            >
              <NavigateBeforeRounded />
            </button>
            <text className="Page-Btn-Text">{curPage}</text>
            <button
              onClick={() => {
                handleNextPage(true);
              }}
            >
              <NavigateNextRounded />
            </button>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
