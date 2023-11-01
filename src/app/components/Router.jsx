'use client'
import { useState } from "react";
import { Navigate, RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import HomePage from "./HomePage/HomePage";
import Login from "./SignUp";
import { NotFound } from "./NotFound";
import Navbar from "./Navbar";

export default function Router() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
  
    // create high-level protected route below
    const Protected = ({ children }) => {
      if (!isLoggedIn) {
        return <Navigate to="/" replace />;
      }
      return children;
    };
    // protect the routes for the contact, list and item details pages
    const router = createBrowserRouter([
      {
        path: "/",
        errorElement: <NotFound />,
        element: <Navbar />,
        children: [
          {
            index: true,
            element: <HomePage />
          },
          {
            path: "/sign-up",
            element: <Login />
          }
        ]
      }
    ]);
  
    return (
      <div className="App">
        <RouterProvider router={router} />
      </div>
    );
  }
  