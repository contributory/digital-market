'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  price: number;
  image?: string;
}

async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `/api/products/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  React.useEffect(() => {
    if (results && results.length > 0) {
      setIsOpen(true);
    }
  }, [results]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const handleResultClick = (productId: string) => {
    router.push(`/products/${productId}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results && results.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-9"
            aria-label="Search products"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={isOpen}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {isOpen && results && results.length > 0 && (
        <div
          id="search-results"
          role="listbox"
          className="absolute top-full mt-2 w-full rounded-md border border-border bg-background shadow-lg z-50"
        >
          <ul className="max-h-[300px] overflow-y-auto py-2">
            {results.map((result) => (
              <li
                key={result.id}
                role="option"
                aria-selected="false"
                tabIndex={0}
                onClick={() => handleResultClick(result.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleResultClick(result.id);
                  }
                }}
                className={cn(
                  'px-4 py-2 cursor-pointer transition-colors hover:bg-muted focus:bg-muted focus:outline-none',
                  'flex items-center gap-3'
                )}
              >
                {result.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.image}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${result.price.toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {results.length > 5 && (
            <div className="border-t border-border px-4 py-2">
              <button
                type="button"
                onClick={() => {
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                  setIsOpen(false);
                }}
                className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                View all results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
