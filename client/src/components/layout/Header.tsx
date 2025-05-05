import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";

const Header = () => {
  const [location] = useLocation();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
    { name: "Categories", path: "/categories/medical-technology" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center">
              <span className="text-primary font-bold text-2xl">
                FitScience<span className="text-secondary">Daily</span>
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 -my-2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="md:hidden">
                <div className="flex flex-col h-full">
                  <div className="pt-5 pb-6 px-5">
                    <Link href="/" className="flex items-center">
                      <span className="text-primary font-bold text-2xl">
                        FitScience<span className="text-secondary">Daily</span>
                      </span>
                    </Link>
                    <nav className="mt-10 flex flex-col gap-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.path}
                          href={link.path}
                          className={`text-base font-medium ${
                            location === link.path
                              ? "text-primary"
                              : "text-neutral-dark hover:text-primary"
                          } transition-all`}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-6">
                      <SearchBar isMobile />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-base font-medium ${
                  location === link.path
                    ? "text-primary"
                    : "text-neutral-dark hover:text-primary"
                } transition-all`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop search */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            <SearchBar />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
