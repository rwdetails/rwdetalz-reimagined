import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroProps {
  onBookNowClick: () => void;
}

const Hero = ({ onBookNowClick }: HeroProps) => {
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Power washing in action" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center animate-fade-in">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6">
          <span className="block mb-2">Power Washing.</span>
          <span className="block glow-text">Reimagined.</span>
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          RWDetailz brings next-level shine to homes, driveways, and businesses. Fast. Clean. Modern.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="glow" size="xl" onClick={onBookNowClick}>
            Book Your Wash
          </Button>
          <Button variant="hero" size="xl" onClick={() => {
            const element = document.getElementById("services");
            if (element) element.scrollIntoView({ behavior: "smooth" });
          }}>
            View Services
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
