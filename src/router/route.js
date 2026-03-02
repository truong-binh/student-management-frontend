import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { rootLoader } from "./rootLoader.js";
import HomeAdmin from "@/pages/Home";
import LoginAdmin from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import StudentDashboard from "@/pages/User/Dashboard";
import MyClasses from "@/pages/User/Classes";
import ClassDetail from "@/pages/User/ClassDetail";
import AssignmentSubmit from "@/pages/User/AssignmentSubmit";
import AssignmentResult from "@/pages/User/AssignmentResult";
import GradeFeedback from "@/pages/User/GradeFeedback";
import Feedback from "@/pages/User/Feedback";

import Profile from "@/pages/User/Profile";
import Schedule from "@/pages/User/Schedule";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  // Auth Routes
  {
    path: "/login",
    element: <LoginAdmin />,
    loader: ({ request, params }) => rootLoader({ request, params }, false),
  },
  {
    path: "/register",
    element: <Register />,
    loader: ({ request, params }) => rootLoader({ request, params }, false),
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    loader: ({ request, params }) => rootLoader({ request, params }, false),
  },
  // UI Student
  {
    path: "/dashboard",
    element: <StudentDashboard />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/classes",
    element: <MyClasses />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/classes/:id",
    element: <ClassDetail />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/classes/:id/assignments/:assignmentId",
    element: <AssignmentSubmit />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/classes/:id/assignments/:assignmentId/result",
    element: <AssignmentResult />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/classes/:id/assignments/:assignmentId/feedback",
    element: <GradeFeedback />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/feedback",

    element: <Feedback />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/profile",
    element: <Profile />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/schedule",
    element: <Schedule />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  // UI Admin
  {
    path: "/admin",
    children: [
      {
        path: "",
        element: <HomeAdmin />,
        loader: ({ request, params }) => rootLoader({ request, params }, true),
      },
      {
        path: "login",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);

export default router;
