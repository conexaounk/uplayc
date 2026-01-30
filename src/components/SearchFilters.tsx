import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreChange,
}: SearchFiltersProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar DJs ou packs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card border-border/50 focus:border-primary/50 focus:ring-primary/20 h-12"
          />
        </div>
      </div>
    </div>
  );
}
