import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { rootLoader } from "./rootLoader.js";
import HomeAdmin from "@/pages/Home";
import LoginAdmin from "@/pages/Auth/Login";

const router = createBrowserRouter([
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
        element: <LoginAdmin />,
        loader: ({ request, params }) => rootLoader({ request, params }, false),
      },
    ],
  },
]);

export default router;
