import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import StartCreating from "./pages/StartCreating";
import Templates from "./pages/Templates";
import NotFound from "./pages/NotFound";
import Login from "./pages/login";
import Register from "./pages/register";
import { PresentationProvider } from "./contexts/PresentationContext";
import { AuthProvider, useAuth } from "./AuthContext"; // Add this

const queryClient = new QueryClient();

// Protect routes with this wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn, authReady } = useAuth();

  // Wait for Firebase to restore the session before deciding, so a hard
  // refresh doesn't bounce a logged-in user to /login.
  if (!authReady && localStorage.getItem("isLoggedIn") === "true") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/login" />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      }
    />
    <Route
      path="/start-creating"
      element={
        <ProtectedRoute>
          <StartCreating />
        </ProtectedRoute>
      }
    />
    <Route
      path="/templates"
      element={
        <ProtectedRoute>
          <Templates />
        </ProtectedRoute>
      }
    />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PresentationProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </PresentationProvider>
  </QueryClientProvider>
);

export default App;
