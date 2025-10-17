import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold glow-text">
            RW<span className="text-primary">Detailz</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:9548656205" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              <span className="font-semibold">(954) 865-6205</span>
            </a>
            <Button variant="glow" size="sm">
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
            <a href="tel:9548656205" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              <span className="font-semibold">(954) 865-6205</span>
            </a>
            <Button variant="glow" size="sm" className="w-full">
              Book Now
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
