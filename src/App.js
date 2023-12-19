import './App.css';
import { useState,useRef } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup,GoogleAuthProvider, signOut  } from "firebase/auth";
import { useCollectionData,useCollection,useDocument, collectionData } from 'react-firebase-hooks/firestore';
import 'firebase/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { collection, addDoc,doc, deleteDoc } from "firebase/firestore"; 
import { FirestoreDataConverter } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuHjDeVaYbdQGomCYgtZeB75p92yJbKpw",
  authDomain: "chatroom-ffe16.firebaseapp.com",
  projectId: "chatroom-ffe16",
  storageBucket: "chatroom-ffe16.appspot.com",
  messagingSenderId: "347790169059",
  appId: "1:347790169059:web:065c03fd02b7dcc27ec6d6",
  measurementId: "G-8E9ZNG1CQ4"
};

const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore =firebase.firestore();

const db = getFirestore(app);


function App() {
  const [user] = useAuthState(auth)
  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function ChatRoom(){
  const dummy = useRef();

  // Try using FireStoreDataConverter 
  type ChatMessage = {
    createdAt: timestamp,
    photoURL: string,
    text: string,
    uid:string,
    id: string,
    ref: DocumentReference<DocumentData>,
  };


  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query,{idField:'id'});
  console.log(messages);

  //const documentIds = messages ? messages.map(message => message.id) : [];
  //console.log(documentIds);
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  // const testdeletedoc= async (e) =>{
  //   e.preventDefault();
  //   console.log("delete");
  //   await deleteDoc(doc(db, "users","ncxst9U3Q3eHXEHJK9Yu"));
  // }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage id={msg.id} message={msg} />)}
      <span ref={dummy}></span>
    </main>

    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
      <button type="submit" disabled={!formValue}>🕊️</button>
    </form>
  </>)
}

function ChatMessage(props) {
  const { text, uid, photoURL} = props.message;
  // When displaying messages, my message is different from others' messages -> sent: mine; received: others
  // that's why need to keep track of uid when uid is not displayed outside
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="bom" />
      <p>{text}</p>
    </div>
  </>)
}

function SignIn(){
  const signInWithGoogle=()=>{
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result.user.email);
      }).catch((error) => {
        const errorMessage = error.message;
        console.log(errorMessage);
      });
    // testadddoc();
  }

  // const testadddoc = async ()=>{
  //   try {
  //     const docRef = await addDoc(collection(db, "users"), {
  //       first: "Ada",
  //       last: "Lovelace",
  //       born: 1815
  //     });
  //     console.log("Document written with ID: ", docRef.id);
  //   } catch (e) {
  //     console.error("Error adding document: ", e);
  //   }
  // }
  return(
    <>
      <button onClick = {signInWithGoogle}>Sign in with Google </button>
    </>
  )
}

function SignOut() {
  const signOutFromGoogle =()=>{
    signOut(auth).then(() => {
    console.log("Signed out successful");
  }).catch((error) => {
    console.log(error);
  });
  }
  return auth.currentUser && (
    <button className="sign-out" onClick={signOutFromGoogle}>Sign Out</button>
  )
}

export default App;
