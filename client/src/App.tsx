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
import HealthDashboard from "@/pages/HealthDashboard";
import BiomarkerSystem from "@/pages/BiomarkerSystem";
import ProtocolEngine from "@/pages/ProtocolEngine";
import ProviderDirectory from "@/pages/ProviderDirectory";
import ProgressTracking from "@/pages/ProgressTracking";
import LabTests from "@/pages/LabTests";
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <AuthProvider>
          <TooltipProvider>
            <Switch>
              {/* ── Public routes ── */}
              <Route path="/" component={Home} />
              <Route path="/signup" component={ServiceSignup} />
              <Route path="/onboarding" component={ServiceSignup} />
              <Route path="/account" component={Account} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/weekly-wellness-goodness" component={WeeklyWellnessGoodness} />

              {/* ── Health & Wellness platform routes ── */}
              <Route path="/dashboard" component={HealthDashboard} />
              <Route path="/biomarkers/:slug" component={BiomarkerSystem} />
              <Route path="/biomarkers" component={BiomarkerSystem} />
              <Route path="/protocols" component={ProtocolEngine} />
              <Route path="/providers" component={ProviderDirectory} />
              <Route path="/progress" component={ProgressTracking} />
              <Route path="/lab-tests" component={LabTests} />

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
