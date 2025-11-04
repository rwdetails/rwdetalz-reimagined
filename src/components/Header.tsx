import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight, LogOut, LogIn, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onBookNowClick: () => void;
  onTabChange: (tab: string) => void;
}

const Header = ({ onBookNowClick, onTabChange }: HeaderProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -60% 0px",
      }
    );

    const sections = ["home", "services", "why", "about", "reviews-gallery", "track", "contact"];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string, tab?: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
      if (tab) {
        onTabChange(tab);
      }
    }
  };

  const handleBookNow = () => {
    onBookNowClick();
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    navigate("/auth");
    setIsMenuOpen(false);
  };

  const isActive = (section: string) => {
    if (section === "reviews" || section === "gallery") {
      return activeSection === "reviews-gallery";
    }
    return activeSection === section;
  };

  const navButtonClass = (section: string) => {
    return `text-foreground hover:text-primary transition-colors ${
      isActive(section) ? "text-primary font-semibold" : ""
    }`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="Go to homepage">
            <img src="/logo.png" alt="RWDetailz logo" className="h-10 w-10" />
            <div className="text-2xl font-bold glow-text">
              RW<span className="text-primary">Detailz</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("home")} className={navButtonClass("home")}>
              Home
            </button>
            <button onClick={() => scrollToSection("services")} className={navButtonClass("services")}>
              Services
            </button>
            <button onClick={() => scrollToSection("about")} className={navButtonClass("about")}>
              About
            </button>
            <button onClick={() => scrollToSection("contact")} className={navButtonClass("contact")}>
              Contact
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="glow" size="sm" onClick={handleBookNow}>
              Book Now
            </Button>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-foreground">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 py-4 animate-fade-in">
            <button onClick={() => scrollToSection("home")} className={`${navButtonClass("home")} text-left`}>
              Home
            </button>
            <button onClick={() => scrollToSection("services")} className={`${navButtonClass("services")} text-left`}>
              Services
            </button>
            <button onClick={() => scrollToSection("about")} className={`${navButtonClass("about")} text-left`}>
              About
            </button>
            <button onClick={() => scrollToSection("contact")} className={`${navButtonClass("contact")} text-left`}>
              Contact
            </button>
            <Button variant="glow" size="sm" onClick={handleBookNow} className="w-full">
              Book Now
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
