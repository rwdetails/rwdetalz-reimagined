import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold glow-text">
            RW<span className="text-primary">Detailz</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("home")} className="text-foreground hover:text-primary transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection("services")} className="text-foreground hover:text-primary transition-colors">
              Services
            </button>
            <button onClick={() => scrollToSection("why")} className="text-foreground hover:text-primary transition-colors">
              Why Us
            </button>
            <button onClick={() => scrollToSection("about")} className="text-foreground hover:text-primary transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection("contact")} className="text-foreground hover:text-primary transition-colors">
              Contact
            </button>
            <Button variant="glow" size="sm" onClick={() => scrollToSection("contact")}>
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-foreground">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 py-4 animate-fade-in">
            <button onClick={() => scrollToSection("home")} className="text-foreground hover:text-primary transition-colors text-left">
              Home
            </button>
            <button onClick={() => scrollToSection("services")} className="text-foreground hover:text-primary transition-colors text-left">
              Services
            </button>
            <button onClick={() => scrollToSection("why")} className="text-foreground hover:text-primary transition-colors text-left">
              Why Us
            </button>
            <button onClick={() => scrollToSection("about")} className="text-foreground hover:text-primary transition-colors text-left">
              About
            </button>
            <button onClick={() => scrollToSection("contact")} className="text-foreground hover:text-primary transition-colors text-left">
              Contact
            </button>
            <Button variant="glow" size="sm" onClick={() => scrollToSection("contact")} className="w-full">
              Book Now
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
