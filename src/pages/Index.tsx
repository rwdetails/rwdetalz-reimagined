import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import About from "@/components/About";
import BookingTracker from "@/components/BookingTracker";
import Contact from "@/components/Contact";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";
import { useState } from "react";

const Index = () => {
  const [showBooking, setShowBooking] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onBookNowClick={() => setShowBooking(true)} />
      <main>
        {showBooking ? (
          <div className="pt-[72px]">
            <BookingForm onClose={() => setShowBooking(false)} />
          </div>
        ) : (
          <>
            <Hero onBookNowClick={() => setShowBooking(true)} />
            <Services />
            <WhyUs />
            <About />
            <BookingTracker />
            <Contact />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
