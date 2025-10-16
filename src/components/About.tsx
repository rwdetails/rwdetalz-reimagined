const About = () => {
  return (
    <section id="about" className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card rounded-2xl p-8 md:p-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Meet the <span className="glow-text">Founders</span>
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            RWDetailz was started by <span className="text-primary font-semibold">Rakeem and Wood</span> — two 15-year-old entrepreneurs bringing fresh energy and next-gen quality to power washing.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            We combine cutting-edge techniques with eco-friendly practices to deliver results that exceed expectations. Our youth drives our innovation, and our dedication ensures every job is done right.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Whether it's a residential driveway, commercial property, or roof cleaning, we bring the same level of energy and attention to detail to every project. Our mission is simple: make everything we touch look brand new.
          </p>

          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground italic">
              "We're not just cleaning surfaces — we're building something that matters."
            </p>
            <p className="text-primary font-bold mt-2">— Rakeem & Wood</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
