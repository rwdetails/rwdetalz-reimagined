const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold glow-text mb-2">
              RW<span className="text-primary">Detailz</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with drive, detail, and dedication.
            </p>
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
          <p>© 2025 RWDetailz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
