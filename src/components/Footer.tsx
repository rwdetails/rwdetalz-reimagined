import { Instagram, Music } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 border-t border-border/50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold glow-text mb-2">
              RW<span className="text-primary">Detailz</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Built with drive, detail, and dedication.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <a
                href="https://instagram.com/rwdetailz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors glow-border"
              >
                <Instagram className="w-5 h-5 text-primary" />
              </a>
              <a
                href="https://tiktok.com/@rwdetailz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors glow-border"
              >
                <Music className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#contact" className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground">
          <p>© {currentYear} RWDetailz. All rights reserved.</p>
          <p className="mt-2 text-xs">
            Phone: <a href="tel:9548656205" className="text-primary hover:underline">(954) 865-6205</a> | 
            Email: <a href="mailto:rwdetailz@gmail.com" className="text-primary hover:underline"> rwdetailz@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
