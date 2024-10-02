# Chat Web Application

A real-time chat web application built using **React** for the frontend and **Firebase** for the backend. This app supports real-time messaging, user authentication, and a simple user interface for seamless chatting.

## Features

- **Real-time Messaging**: Messages are instantly updated across all users using Firebase's real-time database.
- **User Authentication**: Sign up and login using Google Authentication via Firebase.
- **Responsive Design**: The application is fully responsive and works on all screen sizes.
- **User Avatars**: Users have profile pictures fetched from their Google accounts.
- **Secure**: User authentication and data are securely handled by Firebase.

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Deployment**: Vercel or Netlify (optional)
  
## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v14 or later)
- Firebase account and project set up (see below)
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/chat-web-app.git
   cd chat-web-app
2. Install dependencies:
  npm install
Set up Firebase:

. Create a new Firebase project at Firebase Console.

. Enable Firestore for real-time database.

. Enable Firebase Authentication and add Google as a sign-in provider.

. Create a .env file in the root directory and add your Firebase config keys:


  REACT_APP_FIREBASE_API_KEY=your-api-key
  REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
  REACT_APP_FIREBASE_PROJECT_ID=your-project-id
  REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
  REACT_APP_FIREBASE_APP_ID=your-app-id

Run the application:

     ```bash
      npm run dev
      Open http://localhost:3000 to view the app in the browser.

Firebase Setup
To configure Firebase, follow these steps:

Go to the Firebase Console.
Create a new project or use an existing project.
Enable Firestore Database and Firebase Authentication (select Google as a sign-in method).
Copy your Firebase config from the project settings and paste it into your .env file as shown above.
Deployment
You can deploy this app to platforms like Vercel or Netlify. To deploy:

Push your project to a GitHub repository.
Link the repository to Vercel or Netlify.
Ensure your Firebase configuration is set in the environment variables on the platform.
License

This project is licensed under the MIT License. See the LICENSE file for more details.









