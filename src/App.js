
import firebase from 'firebase';
import { useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import './App.css';

var firebaseConfig = {
  apiKey: "AIzaSyDS8ie71CttK6ne1S0cbdMtH6pV7ebtJbk",
  authDomain: "chat-app-98076.firebaseapp.com",
  projectId: "chat-app-98076",
  storageBucket: "chat-app-98076.appspot.com",
  messagingSenderId: "22170534568",
  appId: "1:22170534568:web:04ad2b1fc60ecdbdd9b89d"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
      <h1>Chat💬</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const SignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  };

  return <button onClick={SignInWithGoogle}>Sign In with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {

  const scroll = useRef();

  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [ formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    scroll.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <div ref={ scroll }></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">Submit</button>
      </form>

    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved';

  return(
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>

    </div>
  )
}

export default App;

