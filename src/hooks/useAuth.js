import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getCurUser } from "../api/FirebaseApi";

export const useCurAuth = (initEmail = null) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const fetchData = async (email) => {
      try {
        const curUser = await getCurUser(email);
        if (curUser) {
          setUser(curUser);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (initEmail) {
      fetchData(initEmail);
    } else {
      const unsubscribe = onAuthStateChanged(auth, (curUser) => {
        console.log("did state change?");
        if (curUser) {
          fetchData(curUser.email);
        } else {
          setUser(null);
          setLoading(false);
        }
      });
    }
  }, []);

  return { user, loading };
};
