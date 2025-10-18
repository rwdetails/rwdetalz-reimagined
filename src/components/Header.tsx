import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "gallery", label: "Gallery" },
  { id: "about", label: "About" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
  { id: "careers", label: "Careers" },
  { id: "contact", label: "Contact" },
  { id: "track", label: "Track Job" },
];

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <button 
          onClick={() => handleNavClick("home")} 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center glow-border">
            <span className="text-2xl font-bold glow-text">RW</span>
          </div>
          <span className="text-xl font-bold hidden sm:block">RWDetailz</span>
        </button>

        <nav className="hidden lg:flex items-center gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3 py-2 rounded-lg transition-all ${
                activeTab === item.id
                  ? "bg-primary/20 text-primary font-semibold"
                  : "hover:text-primary hover:bg-primary/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:9548656205"
            className="hidden sm:flex items-center gap-2 text-sm hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4" />
            (954) 865-6205
          </a>
          <Button variant="glow" onClick={() => handleNavClick("book")} className="hidden sm:flex">
            Book Now
          </Button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === item.id
                      ? "bg-primary/20 text-primary font-semibold"
                      : "hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Button variant="glow" onClick={() => handleNavClick("book")} className="mt-2">
                Book Now
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
