import { Input } from "@/components/ui/input";
import { useSearchRegions } from "@/hooks/useRegions";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";
import { BarChart3, GitCompare, Home, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: results } = useSearchRegions(query);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-64" data-ocid="search-input">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="지역 검색..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-8 h-8 bg-muted/60 border-border/60 text-sm focus:bg-card"
        />
      </div>
      {open && results && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {results.slice(0, 8).map((region) => (
            <button
              key={region.id.toString()}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors flex items-center gap-2"
              onClick={() => {
                router.navigate({
                  to: "/region/$id",
                  params: { id: region.id.toString() },
                });
                setQuery("");
                setOpen(false);
              }}
              data-ocid="search-result-item"
            >
              <span className="text-foreground">{region.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {region.level === "province"
                  ? "광역시/도"
                  : region.level === "city"
                    ? "시/군/구"
                    : "동/읍/면"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const navLinks = [
  { to: "/" as const, label: "대시보드", icon: Home },
  { to: "/compare" as const, label: "비교", icon: GitCompare },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border/60 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-6">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0"
            data-ocid="nav-brand"
          >
            <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center">
              <BarChart3 size={14} className="text-primary" />
            </div>
            <span className="font-display font-semibold text-foreground text-sm tracking-tight">
              대한민국 부동산
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1" data-ocid="main-nav">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
                activeProps={{ className: "text-foreground bg-muted/80" }}
                data-ocid={`nav-link-${label}`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <SearchBar />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted/40 border-t border-border/40 py-4">
        <div className="max-w-screen-xl mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
