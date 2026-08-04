import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return isSignedIn ? <Outlet /> : <Navigate to="/landing" replace />;
}