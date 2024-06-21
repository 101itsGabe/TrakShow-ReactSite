import { initializeApp } from "firebase/app";
import "firebase/firestore";
import {
  getFirestore,
  collection,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
  where,
  limit,
  startAfter,
  endBefore,
  getDoc,
  doc,
  limitToLast,
  endAt
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,

} from "firebase/auth";
import { addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getEps } from "./TVShowApi";
import { queryByRole } from "@testing-library/react";

const firebaseConfig = {
  apiKey: "AIzaSyDixyNjSzDT1dcYNqD2NYCAaOstvbrS-7o",
  authDomain: "showcase-ebfee.firebaseapp.com",
  projectId: "showcase-ebfee",
  storageBucket: "showcase-ebfee.appspot.com",
  messagingSenderId: "649585752875",
  appId: "1:649585752875:web:9650ce3601235eedcbe36e",
  measurementId: "G-FVNP9VQ7XJ",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });


export async function getCurUser(email){
  const userCollection = collection(db, "Users");
    const q = query(userCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if(!querySnapshot.empty){
      const doc = querySnapshot.docs[0];
      return doc.data();
    }
    else{
      return null;
    }
}
export async function getUsers() {
  const usersCollection = collection(db, "Users");
  const usersSnapshot = await getDocs(usersCollection);
  const usersList = usersSnapshot.docs.map((doc) => doc.data());
  //const realList = usersList.map((user) => user.email);
  return usersList;
}

export async function signUpUser(email, password, username) {
  console.log("signging up");
  let user;
  let firebaseUser;
  try {
    await createUserWithEmailAndPassword(auth, email, password).then(
      (userCredential) => {
        // Signed in
        user = userCredential.user;
        console.log("User signed up successfully:", user);
        //return user;
        // Additional code to handle the signed-up user
      }
    );

    const usersCollection = collection(db, "Users");
    //const usersSnapshot = await getDocs(usersCollection);
    if (user != null) {
      const newdoc = await addDoc(usersCollection, {
        email: user.email,
        followercount: 0,
        username: username,
      });
      const tvShowsCollection = collection(newdoc, "tvshows");
      const followingCollection = collection(newdoc, "following");
      const followersCollection = collection(newdoc, "followers");
      firebaseUser = newdoc;
    }
    if (user != null && firebaseUser != null) {
      return firebaseUser;
    }
  } catch (error) {
    console.log(error.message);
  }
}

//I need to make sure username matches what the user signed in did
export async function emailSignIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const userCollection = collection(db, "Users");
    const q = query(userCollection, where("email", "==", user.email));
    const querySnapshot = await getDocs(q);
    if(!querySnapshot.empty){
      const doc = querySnapshot.docs[0];
      const userData = doc.data();
      return userData;
    }
    else{
       return null;
    }

    // Return the email value once it's available
  } catch (error) {
    console.log(error.message);
  }
}
export async function googleSignIn() {
  //const auth = getAuth();
  // console.log("this looks like a load of barnacles");
  try {
    const result = await signInWithPopup(auth, provider); // Wait for the signInWithPopup Promise to resolve
    const user = result.user;
    const userCollection = collection(db, "Users");
    const q = query(userCollection, where("email", "==", user.email));
    const querySnapshot = await getDocs(q);
    let curData = null;
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      curData = doc.data();
    } else {
      const usersCollection = collection(db, "Users");
      const usernameStr = user.email.split("@")[0];
      const newdoc = await addDoc(usersCollection, {
        email: user.email,
        followercount: 0,
        username: usernameStr,
      });
      const tvShowsCollection = collection(newdoc, "tvshows");
      const followingCollection = collection(newdoc, "following");
      const followersCollection = collection(newdoc, "followers");
      curData = newdoc.data();
    }

    return curData;
  } catch (error) {
    console.log(error.message);
    return null; // Return null or handle the error as needed
  }
}

export async function signOutUser() {
  try {
    auth.signOut().then(() => {
      //console.log("User signed out.");
    });
  } catch (error) {
    console.log(error.message);
  }
}

export async function updateEp(email, curShow, newEp, epIndex) {
  try {
    const userCollection = collection(db, "Users");
    const q = query(userCollection, where("email", "==", email));
    const userSnapshot = await getDocs(q);
    if (!userSnapshot.empty) {
      const doc = userSnapshot.docs[0];
      const userTvShowCollection = collection(doc.ref, "tvshows");
      const showQ = query(userTvShowCollection, where("id", "==", curShow.id));
      const userTvShowsSnapshot = await getDocs(showQ);
      if (!userTvShowsSnapshot.empty) {
        const showDoc = userTvShowsSnapshot.docs[0];
        const newValues = {
          curEp: newEp.number,
          curSeason: newEp.season,
          curEpName: newEp.name,
          epIndex: epIndex,
        };
        await updateDoc(showDoc.ref, newValues);
        await addPost(email, curShow, newEp);
      }
    }
  } catch (error) {
    console.error("Error in update", error);
  }
}

export async function getUserShows(username) {
  try {
    const userCollection = collection(db, "Users");
    const q = query(userCollection, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      let userShows = [];
      // Use map to create an array of promises
      const userTvShowCollection = collection(doc.ref, "tvshows");
      const userTvShowsQuery = query(
        userTvShowCollection,
        orderBy("timestamp", "desc")
      );
      const userTvShowsSnapshot = await getDocs(userTvShowsQuery);
      userTvShowsSnapshot.docs.forEach((showDoc) => {
        let showData = showDoc.data();
        userShows.push(showData);
      });
      return userShows;
    }
  } catch (error) {
    console.log(error.message);
  }
}

export async function deleteShow(email, curShow) {
  try {
    const userCollection = collection(db, "Users");
    const q = query(userCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const userTvShowCollection = collection(doc.ref, "tvshows");
      const showQ = query(
        userTvShowCollection,
        where("name", "==", curShow.name)
      );
      const showSnapshot = await getDocs(showQ);
      const showDoc = showSnapshot.docs[0];
      await deleteDoc(showDoc.ref);
    }
  } catch (error) {
    console.log(error.message);
  }
}

export async function isShowAdded(email, curShow) {
  try {
    const userCollection = collection(db, "Users");
    const q = query(userCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const userTvShowCollection = collection(doc.ref, "tvshows");
      const showQ = query(
        userTvShowCollection,
        where("name", "==", curShow.name)
      );
      const showSnapshot = await getDocs(showQ);
      if (!showSnapshot.empty) {
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    console.log(error.message);
  }
  return false; // Return false if the show is not found
}

export async function addComment(id, comment, email, isSpoiler){
  try{
  const feedCollection = collection(db, "UserFeed");
  const feedQ = query(feedCollection, where("id", "==", id));
  const feedSnapshot = await getDocs(feedQ);
  if(!feedSnapshot.empty){
    const feedDoc = feedSnapshot.docs[0]
    const commentCollection = collection(feedDoc.ref, "commentList");
    const docRef = await addDoc(commentCollection, {
      comment: comment,
      email: email,
      isSpoiler: isSpoiler,
    });
    
    // Now that the document is created, update the document with the ID
    const newDoc = {
      comment: comment,
      email: email,
      isSpoiler: isSpoiler,
      id: docRef.id
    };

    // Optionally, update the document in Firestore to include the ID
    await setDoc(docRef, newDoc, { merge: true });

    return newDoc;
  }
}catch(error){
  console.log(error.message);
}
}

export async function getComments(id){
  const feedCollection = collection(db, "UserFeed");
  const feedQ = query(feedCollection, where("id", "==", id));
  const feedSnapshot = await getDocs(feedQ);
  let commentList = []
  let post = null

  if(!feedSnapshot.empty){
    const feedDoc = feedSnapshot.docs[0]
    post = feedDoc.data();
    const commentCollection = collection(feedDoc.ref, "commentList");
    const commentsSnapshop = await getDocs(commentCollection)
    commentsSnapshop.docs.forEach(doc => {
      commentList.push(doc.data());

    })
  };

  return {post,commentList};
}

export async function deleteComment(postID, commentID){
  const feedCollection = collection(db, "UserFeed");
  const feedQ = query(feedCollection, where("id", "==", postID));
  const feedSnapshot = await getDocs(feedQ);
  if(!feedSnapshot.empty){
    const feedDoc = feedSnapshot.docs[0]
    const commentCollection = collection(feedDoc.ref, "commentList");
    const docQ = query(commentCollection, where("id", "==", commentID))
    const commentSnapshot = await getDocs(docQ);
    if(!commentSnapshot.empty){
      const doc = commentSnapshot.docs[0];
      await deleteDoc(doc.ref)
    }
  }
}

export async function addLike(email, post) {
  try{
  const feedCollection = collection(db, "UserFeed");
  const feedQ = query(feedCollection, where("id","==",post.id));
  const feedSnapshot = await getDocs(feedQ);
  if(!feedSnapshot.empty){
    const likesDoc = feedSnapshot.docs[0];
    const likeCollection = collection(likesDoc.ref,"likeList");
    const likeQ = query(likeCollection, where("email","==",email));
    const likesSnapshot = await getDocs(likeQ);
    if(!likesSnapshot.empty){
      const likeDoc = likesSnapshot.docs[0];
      await updateDoc(likesDoc.ref, {
        likes: likesDoc.data().likes - 1
      });
      await deleteDoc(likeDoc.ref)
    }else{
      await addDoc(likeCollection,{
        email: email
      })
      // Increment the likes count on the post document
      await updateDoc(likesDoc.ref, {
        likes: likesDoc.data().likes + 1
      });
    }

    const updatedSnapshot = await getDocs(feedQ);
    const updatedDoc = updatedSnapshot.docs[0];


    console.log("Post going out");
    console.log(updatedDoc.data())
    return updatedDoc.data();


  }
}catch(error){
  console.log(error.message);
}
}

export async function followUser(email, followingEmail) {
  const usersCollection = collection(db, "Users");
  const q = query(usersCollection, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0]; // Assuming email is unique, take the first result
    const followingCollection = collection(userDoc.ref, "following");
    await addDoc(followingCollection, {
      userEmail: followingEmail,
    });
  }

  const q2 = query(usersCollection, where("email", "==", followingEmail));
  const q2Snapshot = await getDocs(q2);

  if (!q2Snapshot.empty) {
    const userDoc = q2Snapshot.docs[0];
    const followersCollection = collection(userDoc.ref, "followers");
    await addDoc(followersCollection, {
      userEmail: email,
    });
  }
}

export async function checkIfFollowing(email, followingEmail) {
  const userCollection = collection(db, "Users");
  const userq = query(userCollection, where("email", "==", email));
  const userSnapshot = await getDocs(userq);
  if (!userSnapshot.empty) {
    const userDoc = userSnapshot.docs[0];
    const followingCollection = collection(userDoc.ref, "following");
    const followeDoc = query(
      followingCollection,
      where("userEmail", "==", followingEmail)
    );
    const querySnapshot = await getDocs(followeDoc);
    if (!querySnapshot.empty) {
      // Following email exists in the collection
      console.log(true);
      return true;
    } else {
      console.log(false);
      // Following email does not exist in the collection
      return false;
    }
  } else {
    console.log("userDoc null :(");
  }
}

export async function unfollowUser(email, followingEmail) {
  const usersCollection = collection(db, "Users");
  const q = query(usersCollection, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0]; // Assuming email is unique, take the first result
    const followingCollection = collection(userDoc.ref, "following");
    const followeDoc = query(
      followingCollection,
      where("userEmail", "==", followingEmail)
    );
    const followSnapshot = await getDocs(followeDoc);
    const docRef = followSnapshot.docs[0];
    await deleteDoc(docRef.ref);
  }

  const q2 = query(usersCollection, where("email", "==", followingEmail));
  const q2Snapshot = await getDocs(q2);

  if (!q2Snapshot.empty) {
    const userDoc = q2Snapshot.docs[0];
    const followingCollection = collection(userDoc.ref, "followers");
    const followeDoc = query(
      followingCollection,
      where("userEmail", "==", email)
    );
    const followSnapshot = await getDocs(followeDoc);
    const docRef = followSnapshot.docs[0];
    await deleteDoc(docRef.ref);
  }
}

export async function getFeed(lastDoc = null) {
  const feedCollection = collection(db, "UserFeed");
  let feedList = [];
  let feedQuery = null;
  let ifMore = false;
 
  if (lastDoc) {
    const lastDocRef = doc(feedCollection,lastDoc.id)
    const lastDocData = await getDoc(lastDocRef);
    feedQuery = query(feedCollection, orderBy("timestamp", "desc"), startAfter(lastDocData), limit(5))
    ifMore = true;
  } else {
    feedQuery = query(feedCollection, orderBy("timestamp", "desc"), limit(5));
  }

  const feedSnapshot = await getDocs(feedQuery);
  if(!feedSnapshot.empty){
  feedSnapshot.forEach(async (doc) => {
    try {
      let data = doc.data();
      feedList.push(data);
    } catch (error) {
      console.og("Error");
    }
  });
}
else{
  console.log("its empty")
}



  return feedList;
  
}

export async function addShow(email, curShow, epName) {
  try {
    const userCollection = collection(db, "Users");
    let ifContains = false;
    let showUpdated = false;
    const q = query(userCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const userTvShowCollection = collection(doc.ref, "tvshows");
      const showQ = query(
        userTvShowCollection,
        where("name", "==", curShow.name)
      );
      const showSnapshot = await getDocs(showQ);
      if (!showSnapshot.empty) {
        ifContains = true;
      }
      if (ifContains === false) {
        await addDoc(userTvShowCollection, {
          id: curShow.id,
          name: curShow.name,
          imgUrl: curShow.image.medium,
          curEp: 1,
          curSeason: 1,
          curEpName: epName,
          epIndex: 0,
          status: curShow.status,
          timestamp: serverTimestamp(),
        });

        const episodes = await getEps(curShow.id);
        const firstEp = episodes[0];
        await addPost(email, curShow, firstEp);

        //AllShows
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

export async function addPost(email, show, ep) {
  try {
    const userCollection = collection(db, "UserFeed");
    const username = email.split("@")[0];
    let curComment;

    if (ep.number === 1 && ep.season === 1) {
      curComment = `${username} just added ${show.name} to their list!`;
    } else {
      curComment = `${username} just got the next episode of ${show.name}, EP: ${ep.number}, Season: ${ep.season}, ${ep.name}!`;
    }

    const docRef = await addDoc(userCollection, {
      comment: curComment,
      email: email,
      likes: 0,
      timestamp: serverTimestamp(),
    });

    await setDoc(docRef, { id: docRef.id }, { merge: true });

    const subCollectionRef = collection(docRef, "likeList"); // replace 'SubCollectionName' with your sub-collection name
    //await addDoc(subCollectionRef, {});
    const commentCollection = collection(docRef, "commentList");
    //await addDoc(commentCollection,{})

  } catch (error) {
    console.error("Error adding post:", error);
  }
}



export { app, analytics, db };
