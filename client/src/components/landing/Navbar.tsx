import { useLocation } from "wouter";
import { Activity, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { brand, cta, navigation } from "./content";

function resolveHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href;
}

// Platform routes that get the health-focused nav
const PLATFORM_ROUTES = ["/dashboard", "/biomarkers", "/protocols", "/providers", "/progress", "/lab-tests"];

const platformNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Biomarkers", href: "/biomarkers", icon: Activity },
  { label: "Protocols", href: "/protocols", icon: Activity },
  { label: "Providers", href: "/providers", icon: Activity },
  { label: "Progress", href: "/progress", icon: Activity },
  { label: "Lab Tests", href: "/lab-tests", icon: Activity },
];

export function Navbar() {
  const [location] = useLocation();
  const isPlatform = PLATFORM_ROUTES.some((r) => location.startsWith(r));

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/85 backdrop-blur-xl">
      <div className="container-custom flex h-20 items-center justify-between gap-6">
        <a href="/" className="min-w-0">
          <div className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
            Wellness<span className="text-primary">&Health4all</span>
          </div>
        </a>

        {isPlatform ? (
          // ── Platform navigation ──────────────────────────────────────
          <>
            <nav className="hidden items-center gap-6 md:flex">
              {platformNav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition hover:text-primary ${
                    location === item.href || location.startsWith(item.href + "/")
                      ? "text-primary font-semibold"
                      : "text-foreground/70"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="hidden md:block">
              <Button asChild variant="outline" size="sm" className="rounded-full px-5">
                <a href="/">← Back to site</a>
              </Button>
            </div>
          </>
        ) : (
          // ── Landing navigation ────────────────────────────────────────
          <>
            <nav className="hidden items-center gap-8 md:flex">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={resolveHref(item.href)}
                  className="text-sm font-medium text-foreground/80 transition hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="hidden items-center gap-3 md:flex">
              <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
                <a href="/dashboard">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  My Dashboard
                </a>
              </Button>
              <Button asChild className="rounded-full px-6">
                <a href="/signup?service=Full%20Wellness%20Pathway">{cta.primary}</a>
              </Button>
            </div>
          </>
        )}

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-primary/15 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="border-l-primary/10 bg-[#fbf8f2] px-8 pt-10">
            <div className="font-display text-2xl text-foreground">{brand.name}</div>
            <nav className="mt-10 flex flex-col gap-5">
              {isPlatform ? (
                <>
                  {platformNav.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`text-lg font-medium transition hover:text-primary ${
                        location === item.href ? "text-primary" : "text-foreground/80"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                  <a href="/" className="text-lg font-medium text-foreground/80 hover:text-primary">← Back to site</a>
                </>
              ) : (
                <>
                  {navigation.map((item) => (
                    <a
                      key={item.href}
                      href={resolveHref(item.href)}
                      className="text-lg font-medium text-foreground/80 transition hover:text-primary"
                    >
                      {item.label}
                    </a>
                  ))}
                  <a href="/dashboard" className="text-lg font-medium text-primary hover:underline">
                    My Health Dashboard →
                  </a>
                </>
              )}
            </nav>
            {!isPlatform && (
              <Button asChild className="mt-8 w-full rounded-full">
                <a href="/signup?service=Fitness%20Pathway">{cta.secondary}</a>
              </Button>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
