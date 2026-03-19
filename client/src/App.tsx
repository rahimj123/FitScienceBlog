import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/platform/AuthProvider";
import { ChatbotWidget } from "@/components/platform/ChatbotWidget";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "@/pages/AdminDashboard";
import Account from "@/pages/Account";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ServiceSignup from "@/pages/ServiceSignup";
import WeeklyWellnessGoodness from "@/pages/WeeklyWellnessGoodness";
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <AuthProvider>
          <TooltipProvider>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/signup" component={ServiceSignup} />
              <Route path="/onboarding" component={ServiceSignup} />
              <Route path="/account" component={Account} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/weekly-wellness-goodness" component={WeeklyWellnessGoodness} />
              <Route component={NotFound} />
            </Switch>
            <ChatbotWidget />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
