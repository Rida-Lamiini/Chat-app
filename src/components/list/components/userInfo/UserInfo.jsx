import React from "react";
import { useUserStore } from "./../../../../lib/UserStore";

function UserInfo() {
  const { currentUser } = useUserStore();

  return (
    <div className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <img
          src={currentUser.profilePhoto || "./avatar."}
          alt=""
          className="w-12 h-12 object-cover  rounded-full"
        />
        <h2>{currentUser.name}</h2>
      </div>
      <div className="flex gap-5">
        <img className="w-5 cursor-pointer" src="./more.png" alt="" />
        <img className="w-5 cursor-pointer" src="./video.png" alt="" />
        <img className="w-5 cursor-pointer" src="./edit.png" alt="" />
      </div>
    </div>
  );
}

export default UserInfo;
