import { useEffect, useRef } from "react";

const WorldwideUsers = () => {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add floating dots animation
    if (globeRef.current) {
      const dots = globeRef.current.querySelectorAll('.user-dot');
      dots.forEach((dot, index) => {
        const delay = index * 0.3;
        (dot as HTMLElement).style.animationDelay = `${delay}s`;
      });
    }
  }, []);

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
          <div className="relative flex items-center justify-center animate-fade-in" ref={globeRef}>
            <div className="relative w-full max-w-md aspect-square">
              {/* Globe with glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-card via-card to-background border border-border shadow-2xl animate-pulse-slow">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full shadow-[0_0_80px_20px_rgba(255,255,255,0.15)] animate-glow-pulse" />
                
                {/* Rotating globe surface */}
                <div className="absolute inset-8 rounded-full overflow-hidden animate-rotate-slow">
                  {/* Dotted world map pattern */}
                  <div className="absolute inset-0 opacity-60">
                    {[...Array(200)].map((_, i) => {
                      const angle = (i / 200) * 360;
                      const radius = 40 + Math.random() * 20;
                      const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                      const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
                      const size = Math.random() * 3 + 1;
                      
                      return (
                        <div
                          key={i}
                          className="absolute rounded-full bg-foreground animate-twinkle"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            animationDelay: `${Math.random() * 5}s`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Highlight shine effect */}
                <div className="absolute top-8 left-8 w-24 h-24 bg-white/20 rounded-full blur-2xl animate-shine" />
              </div>

              {/* Floating user indicator dots */}
              {[
                { top: '20%', left: '25%' },
                { top: '60%', left: '15%' },
                { top: '45%', left: '75%' },
                { top: '70%', left: '60%' },
                { top: '30%', left: '80%' },
              ].map((pos, i) => (
                <div
                  key={i}
                  className="user-dot absolute w-3 h-3 rounded-full bg-white shadow-lg shadow-white/50 animate-ping-slow"
                  style={{
                    top: pos.top,
                    left: pos.left,
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-white animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldwideUsers;
