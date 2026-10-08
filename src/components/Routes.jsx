import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
      Loading…
    </div>
  );
}

// Only logged-in users may see these pages.
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Login / Register: logged-in users get sent to the dashboard instead.
export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to="/" replace />;
  return children;
}
