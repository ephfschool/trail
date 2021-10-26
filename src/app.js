const { setJson, ready, onEvent, createEvent } = launch();

(async () => {
  await ready();
  // console.log(json);
  const userDetails = storage.get("loginFileChange");
  let userIndex;
  let groupIndex;
  json.users.forEach((user, i) => {
    if (user.username == userDetails.username) {
      userIndex = i;
    }
  });
  if (!userIndex) {
    throw "couldn't get user";
  }
  if (!json.users[userIndex].groups) {
    json.users[userIndex].groups = ["dummy"];
    await setJson("users", json.users);
  }
  function addMessage(message) {
    const messagesDiv = document.getElementById("messages");
    const author = document.createElement("p");
    author.classList.add("author");
    author.innerHTML = message.author;
    const text = document.createElement("p");
    text.classList.add("message");
    text.innerHTML = message.text;
    messagesDiv.appendChild(author);
    messagesDiv.appendChild(text);
  }
  function closeDiv(id) {
    const div = document.getElementById(id);
    Array.from(div.children).forEach((element) => {
      element.style.display = "none";
    });
  }
  function openDiv(id) {
    const div = document.getElementById(id);
    Array.from(div.children).forEach((element) => {
      element.style.display = "block";
    });
  }
  function openGroup(index) {
    groupIndex = index;
    const group = json.chats[index];
    closeDiv("create_group");
    closeDiv("invite");
    openDiv("messages");
    openDiv("input_bar");
    openDiv("user_bar");
    const messagesDiv = document.getElementById("messages");
    Array.from(messagesDiv.children).forEach((element) => {
      element.remove();
    });
    group.channels[0].messages.forEach((message) => {
      addMessage(message);
    });
  }
  const groupsBar = document.getElementById("groups_bar");
  json.users[userIndex].groups.forEach((group) => {
    if (group != "dummy") {
      const groupElement = document.createElement("button");
      let name = json.chats[group].name;
      name = /^(\w)/.exec(name)[1];
      groupElement.innerHTML = name;
      groupElement.onclick = () => {
        openGroup(group);
      };
      groupsBar.appendChild(groupElement);
    }
  });
  const newGroupButton = document.createElement("button");
  newGroupButton.innerHTML = "+";
  newGroupButton.id = "new_group";
  newGroupButton.onclick = () => {
    closeDiv("messages");
    closeDiv("input_bar");
    closeDiv("user_bar");
    closeDiv("invite");
    const createGroupDiv = document.getElementById("create_group");
    Array.from(createGroupDiv.children).forEach((element) => {
      element.style.display = "block";
    });
    const newGroupSubmit = document.getElementById("create_group_submit");
    newGroupSubmit.onclick = async () => {
      const newGroupName = document.getElementById("create_group_name").value;
      json.chats.push({
        name: newGroupName,
        members: [userDetails.username],
        channels: [
          {
            name: "General",
            messages: [
              {
                author: "System",
                text: "Welcome to your new server!",
              },
            ],
          },
        ],
      });
      const groupElement = document.createElement("button");
      let name = json.chats[json.chats.length - 1].name;
      name = /^(\w)/.exec(name)[1];
      groupElement.innerHTML = name;
      groupElement.onclick = () => {
        openGroup(json.chats.length - 1);
      };
      groupsBar.appendChild(groupElement);
      openGroup(json.chats.length - 1);
      json.users[userIndex].groups.push(json.chats.length - 1);
      await setJson("users", json.users);
      await setJson("chats", json.chats);
    };
  };
  groupsBar.appendChild(newGroupButton);
  document.getElementById("input_bar_send").onclick = async () => {
    const textElement = document.getElementById("input_bar_text");
    const text = textElement.value;
    textElement.value = "";
    if (text != "") {
      json.chats[groupIndex].channels[0].messages.push({
        author: json.users[userIndex].username,
        text,
      });
      await setJson("chats", json.chats);
      createEvent("message", {
        group: groupIndex,
        author: json.users[userIndex].username,
        text,
      });
      addMessage({
        author: json.users[userIndex].username,
        text,
      });
    }
  };
  const messagesDiv = document.getElementById("messages");
  let lastScrollHeight = messagesDiv.scrollTop;
  const neededScrollHeight = messagesDiv.scrollHeight - messagesDiv.scrollTop;
  let scrollToBottom = true;
  setInterval(() => {
    if (lastScrollHeight != messagesDiv.scrollTop) {
      scrollToBottom = false;
    }
    if (
      messagesDiv.scrollTop + neededScrollHeight ==
      messagesDiv.scrollHeight
    ) {
      scrollToBottom = true;
    }
    if (scrollToBottom) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    lastScrollHeight = messagesDiv.scrollTop;
  });
  onEvent((event) => {
    if (event.type == "message" && event.value.group == groupIndex) {
      addMessage(event.value);
    }
  });
  document.getElementById("input_bar_invite").onclick = () => {
    closeDiv("messages");
    closeDiv("input_bar");
    closeDiv("user_bar");
    openDiv("invite");
  };
  document.getElementById("invite_submit").onclick = async () => {
    const inviteTextElement = document.getElementById("invite_search");
    const inviteText = inviteTextElement.value;
    inviteTextElement.value = "";
    for (const user of json.users) {
      if (user.username == inviteText) {
        user.groups.push(groupIndex);
        alert(`invited ${inviteText} to your chat`);
        openGroup(groupIndex);
        document.getElementById("invite_error").innerHTML = "";
        await setJson("users", json.users);
        return;
      }
    }
    document.getElementById("invite_error").innerHTML =
      "Could not find that user!";
  };
})();
