import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import React, { useState, useEffect, useContext, createContext } from "react";
import { SignIn } from "./pages/SignIn";
import { SearchPage } from "./pages/SearchPage";
import { ShowPage } from "./pages/ShowPage";
import { UserPage } from "./pages/UserPage";
import { FeedPage } from "./pages/FeedPage";
import { SettingsPage } from "./pages/SettingsPage";
import { getUserShow, signOutUser, getCurUser } from "./api/FirebaseApi";
import { Header } from "./pages/Header";
import { SignUpPage } from "./pages/SignUpPage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { SingleFeedPage } from "./pages/SingleFeedPage";
import { ShowReviewPage } from "./pages/ShowReviewPage";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useCurAuth } from "./hooks/useAuth";
import { UserProvider, useUser } from "./hooks/userContext";


export const CurContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  //const [userShows, setShows] = useState([]);
  //const [isMenuToggle, setMenuToggle] = useState(true);
  //const [authUser, setAuth] = useState(null);

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
    <UserProvider>
      <div className="App">
        <Router>
          {user && <Header user={user} />}
          <AppContent />
        </Router>
      </div>
    </UserProvider>
  );
}

const AppContent = () => {
  const { user, authLoading } = useUser();
  const [userShows, setShows] = useState([]);
  const [isMenuToggle, setMenuToggle] = useState(true);

  if (authLoading) {
    <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            {user ? (
              <Navigate to="/searchpage" />
            ) : (
              <SignIn setUserShow={setShows} />
            )}
          </>
        }
      ></Route>
      <Route path="/searchpage" element={<SearchPage user={user} />}></Route>
      <Route
        path="/showpage/:showID"
        element={<ShowPage setUserShows={setShows} />}
      />
      <Route
        path="/userpage/user/:username"
        element={<UserPage userShows={userShows} setUserShows={setShows} />}
      />
      <Route path="/feedpage" element={<FeedPage />} />
      <Route path="/signuppage" element={<SignUpPage />} />
      <Route
        path="/singlefeedpage/:postId"
        element={<SingleFeedPage user={user} />}
      />
      <Route path="/settings/user/:username" element={<SettingsPage />} />
      <Route path="/reviewpage/:showid" element={<ShowReviewPage/>}/>
    </Routes>
  );
};

export default App;
