import React from "react";
import UserInfo from "./components/userInfo/UserInfo";
import ChatList from "./components/chatList/ChatList";

function List() {
  return (
    <div className="flex-1 flex flex-col ">
      <UserInfo />
      <ChatList />
    </div>
  );
}

export default List;
