import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Minus, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserStore } from "./../../../../lib/UserStore";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  getDocs,
  setDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../../lib/Firbase";
import { useChatStore } from "../../../../lib/ChatStore";

export default function ChatList() {
  const [addMode, setAddMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const { currentUser } = useUserStore();

  const { changeChat, chatId } = useChatStore();

  // Fetch user chats
  useEffect(() => {
    if (!currentUser) return;

    const unsub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (docSnap) => {
        const chatData = docSnap.data()?.chats || [];

        const promises = chatData.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId); // Fix the doc function call
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          return { ...item, user }; // Corrected user data merging
        });

        const resolvedChats = await Promise.all(promises);
        setChats(resolvedChats.sort((a, b) => b.updatedAt - a.updatedAt)); // Fix sort comparison
      }
    );

    return () => {
      unsub();
    };
  }, [currentUser]);

  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAvailableUsers(users);
    };

    fetchUsers();
  }, []);

  const filteredUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChats = chats.filter((chat) =>
    chat?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addChat = useCallback(
    async (user) => {
      const chatRef = collection(db, "chats");
      const userChatRef = collection(db, "userchats");

      try {
        // Create a new chat document
        const newChatRef = doc(chatRef);
        await setDoc(newChatRef, {
          createdAt: serverTimestamp(),
          messages: [],
        });

        // Update the chats array for the selected user (add a chat with currentUser as the other party)
        const newChatForSelectedUser = {
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id, // currentUser is the one they're chatting with
          updatedAt: Date.now(),
        };

        await updateDoc(doc(userChatRef, user.id), {
          chats: arrayUnion(newChatForSelectedUser),
        });

        // Update the chats array for the current user (add a chat with the selected user as the other party)
        const newChatForCurrentUser = {
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id, // The selected user is the one currentUser is chatting with
          updatedAt: Date.now(),
        };

        await updateDoc(doc(userChatRef, currentUser.id), {
          chats: arrayUnion(newChatForCurrentUser),
        });

        console.log("New chat created with ID:", newChatRef.id);
      } catch (error) {
        console.error("Error adding chat:", error);
      }
    },
    [currentUser]
  );

  const handleSelect = async (chat) => {
    console.log("Selected chat ID:", chat.chatId); // Log selected chat ID
    changeChat(chat.chatId, chat.user.id);
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              className="pl-10 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
              placeholder="Search users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            size="icon"
            variant="outline"
            className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-full"
            onClick={() => {
              setAddMode(!addMode);
            }}
          >
            {addMode ? (
              <Minus className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
        {addMode && (
          <>
            <Input
              className="py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
              placeholder="Enter chat name"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  // Optionally handle enter key
                }
              }}
            />
            <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-lg max-h-40 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-2 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => addChat(user)}
                >
                  {user.profilePhoto ? (
                    <img
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                      src={user.profilePhoto}
                      alt={user.name}
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  )}
                  <p className="ml-2">{user.name}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <ScrollArea className="flex-1 bg-gray-50 dark:bg-gray-900">
        {filteredChats.map((chat) => (
          <div
            key={chat.chatId}
            className="flex items-center space-x-4 p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-700"
            onClick={() => handleSelect(chat)}
          >
            {chat.user.profilePhoto ? (
              <img
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700"
                src={chat.user.profilePhoto}
                alt={chat.user.name}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {chat.user.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {chat.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
