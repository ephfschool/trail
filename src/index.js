import { launch, json } from "./jsonshare";
import { storage } from "./storage";

const { setJson, firebase, ready } = launch({
  apiKey: "AIzaSyBB2Btfohf4iompHVa58ECDwSt8S5TWYUQ",
  authDomain: "chat-fee82.firebaseapp.com",
  projectId: "chat-fee82",
  storageBucket: "chat-fee82.appspot.com",
  messagingSenderId: "533331922027",
  appId: "1:533331922027:web:e8a2a921b28749a38e352e",
  measurementId: "G-X3NWR893EY",
  databaseURL: "https://chat-fee82-default-rtdb.firebaseio.com/"
});

async function init() {
  await firebase
    .database()
    .ref("json")
    .push({ users: ["dummy"] });
  await setJson("chats", ["dummy"]);
}

// (async () => {
//   localStorage.setItem("login", "{}");
//   await setJson("chats", ["dummy"]);
//   await setJson("groups", []);
//   await setJson("users", ["dummy"]);
//   console.log(json);
//   throw "a";
// })();

if (Object.keys(storage.get("login") ?? {}).length == 0) {
  const login = document.getElementById("login");
  Array.from(login.children).forEach((element) => {
    element.style.display = "block";
  });
} else {
  login(storage.get("login"));
}

function login(user) {
  if (user === null) {
    console.log("null user");
  }
  const loginElement = document.getElementById("login");
  Array.from(loginElement.children).forEach((element) => {
    element.style.display = "none";
  });
  const newAccountElement = document.getElementById("new_account");
  Array.from(newAccountElement.children).forEach((element) => {
    element.style.display = "none";
  });
  storage.set("loginFileChange", user);
  storage.set("login", user);
  const a = document.createElement("a");
  a.href = "/app.html";
  a.click();
}

(async () => {
  await ready();
  document.getElementById("new_account_submit").onclick = () => {
    const username = document.getElementById("new_account_username").value;
    const password = document.getElementById("new_account_password").value;
    function failCreate(message) {
      const error = document.getElementById("new_account_error");
      error.innerHTML = message;
    }
    if (username.length < 3 || username.length > 20) {
      return failCreate("Username is not between 3 and 20 characters!");
    }
    if (password.length < 5 || password.length > 30) {
      return failCreate("Password is not between 5 and 30 characters!");
    }
    for (const user of json.users) {
      if (user.username == username) {
        return failCreate("This username is already taken!");
      }
    }
    json.users.push({ username, password, groups: ["dummy"] });
    setJson("users", json.users);
    console.log(json.users[json.users.length - 1]);
    login({ username, password });
  };
  document.getElementById("login_submit").onclick = () => {
    const username = document.getElementById("login_username").value;
    const password = document.getElementById("login_password").value;
    function failedLogin(text) {
      const error = document.getElementById("login_error");
      error.innerHTML = text;
    }
    for (const user of json.users) {
      if (user.username == username && user.password == password) {
        return login(user);
      }
    }
    failedLogin("Username or password is incorrect");
  };
})();
