import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getCurUser } from "../api/FirebaseApi";

export const useCurAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const auth = getAuth();

    const fetchUserData = async (email) => {
      try {
        const curUserData = await getCurUser(email);
        setUser(curUserData);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (curUser) => {
      console.log("unsubscribing?")
      if (curUser) {
        fetchUserData(curUser.email);
      } else {
        setUser(null);
        setLoading(false); // Set loading to false if no user is logged in
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  console.log("inside Auth", user);

  return { user, loading };
};
