"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Settings,
  Shield,
  Image,
  FileText,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { auth, db } from "../../lib/Firbase";
import { useChatStore } from "../../lib/ChatStore";
import { useUserStore } from "../../lib/UserStore";
import { arrayRemove, arrayUnion, updateDoc, doc } from "firebase/firestore";

export default function Detail() {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const [expandedSections, setExpandedSections] = useState(
    new Set(["sharedPhotos"])
  );
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const isExpanded = (section) => expandedSections.has(section);

  const handleblock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser?.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked
          ? arrayRemove(user?.id)
          : arrayUnion(user?.id),
      });
      changeBlock();
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div
      className={`flex-1 p-6 overflow-y-auto ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="flex justify-end mb-4">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={user?.profilePhoto} alt={user?.name || "User"} />
            <AvatarFallback className="bg-blue-300">JD</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-4 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{user?.name || "John Doe"}</h2>
        <p
          className={`text-center ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Software Developer | Coffee Enthusiast
        </p>
      </div>
      <Separator
        className={`my-6 ${darkMode ? "border-gray-700" : "border-gray-300"}`}
      />
      <div className="space-y-4">
        <ExpandableSection
          title="Chat Settings"
          icon={<Settings className="w-5 h-5 text-blue-500" />}
          isExpanded={isExpanded("chatSettings")}
          onToggle={() => toggleSection("chatSettings")}
          darkMode={darkMode}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Notifications</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span>Read Receipts</span>
              <Switch />
            </div>
          </div>
        </ExpandableSection>
        <ExpandableSection
          title="Privacy & Help"
          icon={<Shield className="w-5 h-5 text-green-500" />}
          isExpanded={isExpanded("privacyHelp")}
          onToggle={() => toggleSection("privacyHelp")}
          darkMode={darkMode}
        >
          <p>Privacy and help content goes here.</p>
        </ExpandableSection>
        <ExpandableSection
          title="Shared Photos"
          icon={<Image className="w-5 h-5 text-purple-500" />}
          isExpanded={isExpanded("sharedPhotos")}
          onToggle={() => toggleSection("sharedPhotos")}
          darkMode={darkMode}
        >
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative group">
                <img
                  src={`/placeholder.svg?height=100&width=100&text=Photo${i}`}
                  alt={`Shared photo ${i}`}
                  className={`w-full h-auto rounded ${
                    darkMode ? "border-gray-700" : "border-gray-300"
                  } border`}
                  onClick={() => setSelectedPhoto(i)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </ExpandableSection>
        <ExpandableSection
          title="Shared Files"
          icon={<FileText className="w-5 h-5 text-red-500" />}
          isExpanded={isExpanded("sharedFiles")}
          onToggle={() => toggleSection("sharedFiles")}
          darkMode={darkMode}
        >
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span>Document.pdf</span>
              <Download className="w-4 h-4" />
            </li>
            <li className="flex items-center justify-between">
              <span>Spreadsheet.xlsx</span>
              <Download className="w-4 h-4" />
            </li>
            <li className="flex items-center justify-between">
              <span>Presentation.pptx</span>
              <Download className="w-4 h-4" />
            </li>
          </ul>
        </ExpandableSection>
      </div>
      <Separator
        className={`my-6 ${darkMode ? "border-gray-700" : "border-gray-300"}`}
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full mb-2">
            {isCurrentUserBlocked
              ? "You are Blocked"
              : isReceiverBlocked
              ? "User blocked"
              : "Block User"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently block John Doe
              from contacting you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleblock}>
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button
        onClick={() => auth.signOut()}
        variant="secondary"
        className="w-full"
      >
        Logout
      </Button>
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={`/placeholder.svg?height=400&width=400&text=Photo${selectedPhoto}`}
              alt={`Enlarged photo ${selectedPhoto}`}
              className="max-w-full max-h-full"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpandableSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  darkMode,
}) {
  return (
    <div>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </div>
      {isExpanded && (
        <div className={`mt-2 ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
          {children}
        </div>
      )}
    </div>
  );
}
