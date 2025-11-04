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
                <div className="text-4xl font-bold glow-text">Growing</div>
                <div className="text-sm text-muted-foreground">Customer Base</div>
              </div>
              <div className="space-y-2 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl font-bold glow-text">100%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Goal</div>
              </div>
              <div className="space-y-2 animate-bounce-in" style={{ animationDelay: '0.3s' }}>
                <div className="text-4xl font-bold glow-text">24/7</div>
                <div className="text-sm text-muted-foreground">Support Available</div>
              </div>
              <div className="space-y-2 animate-bounce-in" style={{ animationDelay: '0.4s' }}>
                <div className="text-4xl font-bold glow-text">Local</div>
                <div className="text-sm text-muted-foreground">Broward Service</div>
              </div>
            </div>
          </div>

          {/* Globe Visualization */}
          <div className="relative flex items-center justify-center animate-fade-in" ref={globeRef}>
            <div className="relative w-full max-w-md aspect-square">
              {/* Main Globe with enhanced glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-card to-background border-2 border-primary/30 shadow-2xl animate-pulse-slow">
                {/* Multiple glow rings for depth */}
                <div className="absolute inset-0 rounded-full shadow-[0_0_120px_40px_rgba(139,92,246,0.3)] animate-glow-pulse" />
                <div className="absolute inset-2 rounded-full shadow-[0_0_80px_20px_rgba(139,92,246,0.2)] animate-glow-pulse" style={{ animationDelay: '0.5s' }} />
                
                {/* Rotating globe surface with better patterns */}
                <div className="absolute inset-8 rounded-full overflow-hidden animate-rotate-slow">
                  {/* Enhanced dotted world map pattern */}
                  <div className="absolute inset-0 opacity-70">
                    {[...Array(300)].map((_, i) => {
                      const angle = (i / 300) * 360;
                      const radius = 35 + Math.random() * 30;
                      const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                      const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
                      const size = Math.random() * 4 + 1;
                      
                      return (
                        <div
                          key={i}
                          className="absolute rounded-full bg-primary animate-twinkle"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            animationDelay: `${Math.random() * 5}s`,
                            boxShadow: `0 0 ${size * 2}px rgba(139,92,246,0.8)`,
                          }}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Orbital rings */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin" style={{ animationDuration: '20s' }} />
                    <div className="absolute inset-4 rounded-full border-2 border-primary/10 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                  </div>
                </div>

                {/* Enhanced highlight shine effect */}
                <div className="absolute top-8 left-8 w-32 h-32 bg-white/30 rounded-full blur-3xl animate-shine" />
                <div className="absolute bottom-12 right-12 w-24 h-24 bg-primary/40 rounded-full blur-2xl animate-pulse" />
              </div>

              {/* Floating user indicator dots with enhanced effects */}
              {[
                { top: '20%', left: '25%' },
                { top: '60%', left: '15%' },
                { top: '45%', left: '75%' },
                { top: '70%', left: '60%' },
                { top: '30%', left: '80%' },
                { top: '50%', left: '40%' },
                { top: '80%', left: '30%' },
              ].map((pos, i) => (
                <div
                  key={i}
                  className="user-dot absolute w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50 animate-ping-slow"
                  style={{
                    top: pos.top,
                    left: pos.left,
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-primary animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-white/50" />
                </div>
              ))}
              
              {/* Connection lines between dots */}
              <svg className="absolute inset-0 w-full h-full opacity-30">
                <line x1="25%" y1="20%" x2="75%" y2="45%" stroke="rgba(139,92,246,0.5)" strokeWidth="1" className="animate-pulse" />
                <line x1="15%" y1="60%" x2="60%" y2="70%" stroke="rgba(139,92,246,0.5)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                <line x1="75%" y1="45%" x2="80%" y2="30%" stroke="rgba(139,92,246,0.5)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '1s' }} />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldwideUsers;
