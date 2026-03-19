import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { brand, cta, navigation } from "./content";

function resolveHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href;
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/85 backdrop-blur-xl">
      <div className="container-custom flex h-20 items-center justify-between gap-6">
        <a href="#top" className="min-w-0">
          <div className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
            Wellness with <span className="text-primary">Dr. Jindani</span>
          </div>
        </a>

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

        <div className="hidden md:block">
          <Button asChild className="rounded-full px-6">
            <a href="#contact">{cta.primary}</a>
          </Button>
        </div>

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
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={resolveHref(item.href)}
                  className="text-lg font-medium text-foreground/80 transition hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <Button asChild className="mt-8 w-full rounded-full">
              <a href="#contact">{cta.secondary}</a>
            </Button>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
