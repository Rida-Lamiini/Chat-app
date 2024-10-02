import { useEffect, useState } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import { BrowserRouter } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/Firbase";
import { useUserStore } from "./lib/UserStore";
import { useChatStore } from "./lib/ChatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  const { chatId } = useChatStore();
  console.log(chatId);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user?.uid);
      }
      return () => {
        unSub();
      };
    });
  }, [fetchUserInfo]);

  return (
    <div>
      <BrowserRouter>
        {currentUser ? (
          <div className="flex w-[90vw] h-[90vh] rounded-[12px] bg-[rgba(17,25,40,0.75)] border border-[rgba(255,255,255,0.125)]">
            <List />
            {chatId && <Chat />}
            {<Detail />}
          </div>
        ) : (
          <div className="w-[90vw] h-[90vh] rounded-[12px] border border-[rgba(255,255,255,0.125)]">
            <Login />
          </div>
        )}
      </BrowserRouter>
    </div>
  );
};

export default App;
