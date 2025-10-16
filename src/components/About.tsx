const About = () => {
  return (
    <section id="about" className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card rounded-2xl p-8 md:p-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Meet the <span className="glow-text">Founders</span>
          </h2>
          
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              RWDetailz was built by <span className="text-primary font-semibold">Rakeem</span> and{" "}
              <span className="text-primary font-semibold">Wood</span> — two 15-year-old entrepreneurs 
              who saw an opportunity to do things differently in the cleaning industry.
            </p>
            
            <p>
              While most kids their age are focused on school and social media, Rakeem and Wood are 
              building a real business from the ground up. They're not afraid to get their hands dirty, 
              literally and figuratively. From power washing driveways at dawn to managing bookings 
              and customer service, they handle it all.
            </p>
            
            <p>
              What sets RWDetailz apart isn't just the quality of work — it's the <span className="text-primary font-semibold">energy</span>, 
              the <span className="text-primary font-semibold">innovation</span>, and the{" "}
              <span className="text-primary font-semibold">attention to detail</span> that only 
              young, hungry entrepreneurs can bring. They're proving that age is just a number when 
              you've got drive, dedication, and a vision for something better.
            </p>
            
            <p className="text-foreground font-medium pt-4">
              Every job is personal. Every client becomes part of the RWDetailz story. 
              And every surface they clean shines with the pride of young founders building their legacy.
            </p>
          </div>

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
