import { Suspense, lazy, useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";

// Pages List
const Dashboard = lazy(() => import("./components/dashboard/Dashboard"));
const Profile = lazy(() => import("./components/user/Profile"));
const Login = lazy(() => import("./components/auth/Login"));
const Signup = lazy(() => import("./components/auth/Signup"));

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
  ]);

  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>;
};

export default ProjectRoutes;
