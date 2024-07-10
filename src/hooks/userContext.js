import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getCurUser } from "../api/FirebaseApi"

export const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, authLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);