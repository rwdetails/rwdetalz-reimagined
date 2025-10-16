import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import About from "@/components/About";
import BookingTracker from "@/components/BookingTracker";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="home">
        <Hero />
        <Services />
        <WhyUs />
        <About />
        <BookingTracker />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
