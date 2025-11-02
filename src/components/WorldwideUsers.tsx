import Globe3D from "./Globe3D";

const WorldwideUsers = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Floating bubbles background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-float-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Users <span className="glow-text">Worldwide</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Join our growing community of users who trust and use RWDetailz daily.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="space-y-2 animate-bounce-in" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl font-bold glow-text">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="space-y-2 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl font-bold glow-text">50+</div>
                <div className="text-sm text-muted-foreground">Cities Served</div>
              </div>
              <div className="space-y-2 animate-bounce-in" style={{ animationDelay: '0.3s' }}>
                <div className="text-4xl font-bold glow-text">99%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div className="space-y-2 animate-bounce-in" style={{ animationDelay: '0.4s' }}>
                <div className="text-4xl font-bold glow-text">24/7</div>
                <div className="text-sm text-muted-foreground">Support Available</div>
              </div>
            </div>
          </div>

          {/* Globe Visualization */}
          <div className="relative flex items-center justify-center animate-fade-in">
            <div className="relative w-full max-w-lg aspect-square">
              <Globe3D />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldwideUsers;
