import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { rootLoader } from "./rootLoader.js";
import HomeAdmin from "@/pages/Home";
import LoginAdmin from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import VerifyEmail from "@/pages/Auth/VerifyEmail";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import StudentDashboard from "@/pages/User/Dashboard";
import UpcomingDeadlines from "@/pages/User/UpcomingDeadlines";
import GradeOverview from "@/pages/User/GradeOverview";
import MyClasses from "@/pages/User/Classes";
import ClassDetail from "@/pages/User/ClassDetail";
import ClassAnnouncements from "@/pages/User/ClassAnnouncements";
import AssignmentSubmit from "@/pages/User/AssignmentSubmit";
import AssignmentResult from "@/pages/User/AssignmentResult";
import GradeFeedback from "@/pages/User/GradeFeedback";
import Feedback from "@/pages/User/Feedback";
import Profile from "@/pages/User/Profile";
import Schedule from "@/pages/User/Schedule";
import TeacherDashboard from "@/pages/Teacher/Dashboard";
import TeacherClasses from "@/pages/Teacher/Classes";
import TeacherClassDetail from "@/pages/Teacher/ClassDetail";
import TeacherGradeEdit from "@/pages/Teacher/GradeEdit";
import TeacherFeedback from "@/pages/Teacher/Feedback";
import TeacherSchedule from "@/pages/Teacher/Schedule";
import TeacherProfile from "@/pages/Teacher/Profile";



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
    path: "/verify-email",
    element: <VerifyEmail />,
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
    path: "/dashboard/upcoming-deadlines",
    element: <UpcomingDeadlines />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/dashboard/grade-overview",
    element: <GradeOverview />,
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
    path: "/classes/:id/announcements",
    element: <ClassAnnouncements />,
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
  //UI Teacher
  {
    path: "/teacher/dashboard",
    element: <TeacherDashboard />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/teacher/classes",
    element: <TeacherClasses />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/teacher/classes/:id",
    element: <TeacherClassDetail />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/teacher/classes/:id/assignments/:assignmentId/grade-edit/:studentId",
    element: <TeacherGradeEdit />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/teacher/feedback",
    element: <TeacherFeedback />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/teacher/schedule",
    element: <TeacherSchedule />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
  {
    path: "/teacher/profile",
    element: <TeacherProfile />,
    loader: ({ request, params }) => rootLoader({ request, params }, true),
  },
]);

export default router;
