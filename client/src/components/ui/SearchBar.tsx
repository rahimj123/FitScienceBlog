import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  isMobile?: boolean;
}

const SearchBar = ({ isMobile = false }: SearchBarProps) => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 ${isMobile ? 'py-2' : 'py-2'} pr-4 border border-neutral-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="h-4 w-4 text-neutral-medium" />
        </div>
        {isMobile && (
          <Button
            type="submit"
            className="mt-2 w-full"
            variant="default"
          >
            Search
          </Button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
