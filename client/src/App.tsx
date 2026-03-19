import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ServiceSignup from "@/pages/ServiceSignup";
import WeeklyWellnessGoodness from "@/pages/WeeklyWellnessGoodness";
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <TooltipProvider>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/signup" component={ServiceSignup} />
            <Route path="/onboarding" component={ServiceSignup} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/weekly-wellness-goodness" component={WeeklyWellnessGoodness} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
