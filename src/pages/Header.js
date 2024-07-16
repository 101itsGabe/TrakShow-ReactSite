import { useNavigate, Navigate } from "react-router-dom";
import { signOutUser } from "../api/FirebaseApi";
import React, { useState, useEffect } from "react";
import logo from "../images/logo.png";
import { BsSearch } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { PiTelevisionBold } from "react-icons/pi";
import { CgFeed } from "react-icons/cg";
import { IoIosSettings } from "react-icons/io";
import { FaSignOutAlt } from "react-icons/fa";

export const Header = ({ user, setUser }) => {
  const [isMenuToggle, setMenuToggle] = useState(false);

  const handleMenu = () => {
    setMenuToggle(!isMenuToggle);
  };
  const nav = useNavigate();
  const navToShows = (type) => {
    //const username = user.email.split('@')[0];
    if (type) {
      setMenuToggle(!isMenuToggle);
    }
    nav("/userpage/user/" + user.username);
    window.location.reload();
  };
  const navToSearch = (type) => {
    nav("/searchpage");
    if (type) {
      setMenuToggle(!isMenuToggle);
    }
  };

  const navToSettings = () => {
    nav("/settings/user/" + user.username);
  };

  const navToFeed = (type) => {
    nav("/feedpage");
    if (type) {
      setMenuToggle(!isMenuToggle);
    }
  };
  const navToSignin = async (type) => {
    try {
      nav("/");
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.log(error.message);
    }
    if (type) {
      setMenuToggle(!isMenuToggle);
    }
  };

  return (
    <>
      <div className="Header">
        <img width={50} height={50} src={logo}></img>
        <div className="header-btn">
          <button
            onClick={() => {
              navToSearch(false);
            }}
          >
            <FaSearch />
            Search
          </button>
          <button
            onClick={() => {
              navToShows(false);
            }}
          >
            <PiTelevisionBold />
            Shows
          </button>
          <button
            onClick={() => {
              navToFeed(false);
            }}
          >
            <CgFeed />
            Feed
          </button>
          <button
            onClick={() => {
              navToSettings();
            }}
          >
            <IoIosSettings />
            Settings
          </button>
          <button
            onClick={() => {
              navToSignin(false);
            }}
          >
            <FaSignOutAlt />
            Sign-Out
          </button>
        </div>
      </div>
      <button className="Menu-toggle" onClick={handleMenu}>
        <i className="fas fa-bars"></i>
      </button>
      {isMenuToggle && (
        <div className="overlay">
          <div className="Menu-bar">
            <button className="close-btn" onClick={handleMenu}>
              <i className="fas fa-times"></i>
            </button>
            <button
              className="Menu-barbtn"
              onClick={() => {
                navToShows(true);
              }}
            >
              <PiTelevisionBold />
              Shows
            </button>
            <button
              className="Menu-barbtn"
              onClick={() => {
                navToSearch(true);
              }}
            >
              <FaSearch />
              Search
            </button>
            <button
              className="Menu-barbtn"
              onClick={() => {
                navToFeed(true);
              }}
            >
              <CgFeed />
              Feed
            </button>
            <button
              className="Menu-barbtn"
              onClick={() => {
                navToSettings();
              }}
            >
              <IoIosSettings />
              Settings
            </button>
            <button
              className="Menu-barbtn"
              onClick={() => {
                navToSignin(true);
              }}
            >
              <FaSignOutAlt />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
};
