"use client";

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smile, UserPlus, LogIn, Upload as UploadIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/Firbase";
import { Upload } from "../../lib/Upload";
import { doc, setDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e, mode) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (mode === "login" && (!email || !password)) {
      setError("Please fill in all fields");
      return;
    }

    if (mode === "signup" && (!email || !password || !name)) {
      setError("Please fill in all fields");
      return;
    }

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Welcome back! 👋");
        // navigate("/dashboard"); // or the desired page
      } else {
        const resp = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        let imgUrl = null;
        if (profilePhoto) {
          imgUrl = await Upload(profilePhoto);
        }

        await setDoc(doc(db, "users", resp.user.uid), {
          name: name,
          email: email,
          id: resp.user.uid,
          blocked: [],
          profilePhoto: imgUrl,
        });
        await setDoc(doc(db, "userchats", resp.user.uid), {
          chats: [],
        });
        setMessage("Account created successfully! 🎉");
        // navigate("/dashboard");
      }
    } catch (err) {
      setError(
        mode === "login"
          ? "Invalid email or password"
          : "Error creating account"
      );
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]); // Save the actual file, not just URL
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: isLogin
            ? "linear-gradient(to right, #3490dc, #6574cd)"
            : "linear-gradient(to left, #38a169, #68d391)",
        }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="flex w-full max-w-4xl z-5"
        animate={{ x: isLogin ? 0 : "-50%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Login Card */}
        <Card className="w-full max-w-md flex-shrink-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                Welcome Back!
              </CardTitle>
              <Smile className="h-8 w-8 text-yellow-500" />
            </div>
            <CardDescription>Log in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => handleSubmit(e, "login")}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login">Password</Label>
                <Input
                  id="password-login"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => setIsLogin(false)}
              >
                Create one
              </Button>
            </p>
          </CardFooter>
        </Card>

        {/* Signup Card */}
        <Card className="w-full max-w-md flex-shrink-0 ml-4 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">Join Us!</CardTitle>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
            <CardDescription>Create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => handleSubmit(e, "signup")}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name-signup">Name</Label>
                <Input
                  id="name-signup"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  name="name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  name="email"
                  id="email-signup"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  name="password"
                  id="password-signup"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center space-x-4">
                  {profilePhoto && (
                    <img
                      src={URL.createObjectURL(profilePhoto)}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileInput}
                  >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign up
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-gray-500">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => setIsLogin(true)}
              >
                Log in
              </Button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Alert for error or success messages */}
      {error && (
        <motion.div
          className="absolute top-4 left-4 right-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="bg-red-100 text-red-500">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}
      {message && (
        <motion.div
          className="absolute top-4 left-4 right-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="bg-green-100 text-green-500">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
}
