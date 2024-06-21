import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import { SignIn } from "./pages/SignIn";
import { SearchPage } from "./pages/SearchPage";
import { ShowPage } from "./pages/ShowPage";
import { UserPage } from "./pages/UserPage";
import { FeedPage } from "./pages/FeedPage";
import { getUserShow, signOutUser, getCurUser } from "./api/FirebaseApi";
import { Header } from "./pages/Header";
import { SignUpPage } from "./pages/SignUpPage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { SingleFeedPage } from "./pages/SingleFeedPage";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const [user, setUser] = useState(null);
  const [userShows, setShows] = useState([]);
  const [isMenuToggle, setMenuToggle] = useState(true);

  
  useEffect(() => {
    const auth = getAuth();
    
    const fetchUserData = async (email) => {
      try {
        const curUserData = await getCurUser(email);
        setUser(curUserData);
      } catch (error) {
        console.log(error.message);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (curUser) => {
      if (curUser) {
        fetchUserData(curUser.email);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <Router>
        {user && (
          <div>
            <Header user={user} setUser={setUser} />
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <>
                {user ? (
                  <Navigate to="/searchpage" />
                ) : (
                  <SignIn setCurUser={setUser} setUserShow={setShows} />
                )}
              </>
            }
          ></Route>
          <Route
            path="/searchpage"
            element={<SearchPage user={user} />}
          ></Route>
          <Route
            path="/showpage/:showID"
            element={<ShowPage user={user} setUserShows={setShows} />}
          />
          <Route
            path="/userpage/user/:username"
            element={
              <UserPage
                user={user}
                userShows={userShows}
                setUserShows={setShows}
              />
            }
          />
          <Route path="/feedpage" element={<FeedPage user={user} />} />
          <Route
            path="/signuppage"
            element={<SignUpPage setCurUser={setUser} />}
          />
          <Route path="/singlefeedpage/:postId" element={<SingleFeedPage user={user}/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
