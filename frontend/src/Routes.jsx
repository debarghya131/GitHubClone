import React, { Suspense, lazy, useEffect } from "react";
import { Navigate, useNavigate, useRoutes } from "react-router-dom";

// Pages List
const Dashboard = lazy(() => import("./components/dashboard/Dashboard"));
const Profile = lazy(() => import("./components/user/Profile"));
const Login = lazy(() => import("./components/auth/Login"));
const Signup = lazy(() => import("./components/auth/Signup"));
const CreateRepository = lazy(() =>
  import("./components/repo/CreateRepository")
);
const RepositoryDetails = lazy(() =>
  import("./components/repo/RepositoryDetails")
);

// Auth Context
import { useAuth } from "./useAuth";

const ProjectRoutes = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");

    if (userIdFromStorage && !currentUser) {
      setCurrentUser(userIdFromStorage);
    }

    if (
      !userIdFromStorage &&
      !["/auth", "/signup"].includes(window.location.pathname)
    ) {
      navigate("/auth");
    }

    if (userIdFromStorage && window.location.pathname === "/auth") {
      navigate("/");
    }
  }, [currentUser, navigate, setCurrentUser]);

  const element = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/auth",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/create",
      element: <CreateRepository />,
    },
    {
      path: "/repo/:id",
      element: <RepositoryDetails />,
    },
    {
      path: "*",
      element: <Navigate replace to={currentUser ? "/" : "/auth"} />,
    },
  ]);

  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>;
};

export default ProjectRoutes;
