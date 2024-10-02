import { useState, useRef, useEffect } from "react";
import { Phone, Video, Info, Send, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../lib/Firbase"; // Ensure the import path is correct
import { ref, uploadString, getDownloadURL } from "firebase/storage"; // Add these imports
import { useChatStore } from "../../lib/ChatStore";
import { useUserStore } from "../../lib/UserStore";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const chatEndRef = useRef(null);
  const { currentUser } = useUserStore();

  // Scroll to the bottom of the chat on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Listen for messages in Firestore
  useEffect(() => {
    if (!chatId) return; // Exit if no chatId

    const unSub = onSnapshot(doc(db, "chats", chatId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setMessages(data.messages || []); // Update the messages from Firestore
      }
    });

    return () => unSub(); // Clean up the listener
  }, [chatId]); // Depend on chatId

  const sendMessage = async () => {
    let imageUrl = null; // Initialize the image URL

    // Check if there's an image to upload
    if (newImage) {
      const storageRef = ref(storage, `chat_images/${Date.now()}`); // Create a reference to the image in Firebase Storage
      await uploadString(storageRef, newImage, "data_url"); // Upload the image
      imageUrl = await getDownloadURL(storageRef); // Get the download URL
    }

    if (newMessage.trim() || imageUrl) {
      const message = {
        senderId: currentUser.id,
        text: newMessage,
        image: imageUrl || null, // Use the uploaded image URL
        createdAt: { seconds: Math.floor(Date.now() / 1000) }, // Correctly format createdAt
      };

      // Update chat document in Firestore
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(message),
      });

      // Update user chats for both currentUser and the other user
      const userIds = [currentUser.id, user.id];
      userIds.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id);
        const userChatRefSnapshot = await getDoc(userChatRef);

        if (userChatRefSnapshot.exists()) {
          const userchatsData = userChatRefSnapshot.data();
          const chatIndex = userchatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            // Update last message and other chat info
            userchatsData.chats[chatIndex].lastMessage = newMessage;
            userchatsData.chats[chatIndex].isSeen = id !== currentUser.id; // Mark as seen for the other user
            userchatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatRef, {
              chats: userchatsData.chats,
            });
          }
        }
      });

      // Reset the input fields after sending
      setNewMessage("");
      setNewImage(null); // Reset image after sending
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handleImageUpload = (event) => {
    console.log("reda");

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImage(e.target.result); // Save image as base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-[2] flex flex-col h-full bg-gray-100">
      <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-blue-600">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              src={user?.profilePhoto || "/placeholder.svg?height=40&width=40"} // Dynamically set user avatar
              alt="User Avatar"
            />
            <AvatarFallback>{user?.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-white">{user.name}</h2>
            <p className="text-sm text-gray-200">Online</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="text-white">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-grow p-4 bg-gray-100">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.senderId === currentUser.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.senderId === currentUser.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="sent"
                    className="w-32 h-32 object-cover mb-2 rounded-lg"
                  />
                )}
                <p>{message.text}</p>
                <span className="text-xs opacity-50 mt-1 block">
                  {new Date(
                    message.createdAt.seconds * 1000
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-gray-300 bg-gray-100 relative">
        <div className="flex space-x-2">
          <button
            variant="ghost"
            size="icon"
            as="label"
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
            <Input type="file" onChange={handleImageUpload} />
          </button>
          <Input
            className="flex-grow bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 text-black"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (
                newMessage &&
                e.key === "Enter" &&
                !(isCurrentUserBlocked || isReceiverBlocked)
              ) {
                sendMessage();
              }
            }}
            disabled={isCurrentUserBlocked || isReceiverBlocked} // Disable input when blocked
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={isCurrentUserBlocked || isReceiverBlocked} // Disable emoji button when blocked
          >
            <Smile className="h-5 w-5 text-gray-600" />
          </Button>
          <Button
            onClick={sendMessage}
            className="bg-blue-600 text-white"
            disabled={isCurrentUserBlocked || isReceiverBlocked} // Disable send button when blocked
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {showEmojiPicker && (
          <div className="absolute bottom-14 right-0 z-10">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
}
