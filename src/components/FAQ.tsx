import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does a pressure washing job take?",
    answer: "Most residential jobs take 1-3 hours depending on the size and scope. Driveways typically take 1-2 hours, while full house exteriors may take 2-4 hours. We'll give you an estimated time when you book."
  },
  {
    question: "Do I need to be home during the service?",
    answer: "Not necessarily! As long as we have access to water and the areas that need cleaning, we can complete the job. Many customers leave us a key to the water spigot or provide access instructions."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept cash, Venmo, CashApp, Zelle, and all major credit cards. Payment is due upon completion of the service."
  },
  {
    question: "Can I book recurring cleanings?",
    answer: "Absolutely! We offer monthly, quarterly, and seasonal cleaning packages at discounted rates. Contact us to set up a recurring schedule that works for you."
  },
  {
    question: "Do you clean commercial properties?",
    answer: "Yes! We service both residential and commercial properties throughout Broward County. Contact us for a custom quote for your business location."
  },
  {
    question: "What areas do you serve?",
    answer: "We serve all of Fort Lauderdale and Broward County, including Plantation, Coral Springs, Pembroke Pines, Davie, Weston, and surrounding areas."
  },
  {
    question: "Is pressure washing safe for all surfaces?",
    answer: "We use appropriate pressure levels and techniques for each surface. Our soft wash method is perfect for delicate surfaces like roofs and painted walls, while high-pressure cleaning works great for concrete and driveways."
  },
  {
    question: "How often should I get my property pressure washed?",
    answer: "We recommend pressure washing your driveway and sidewalks 1-2 times per year, and your house exterior once a year. In Florida's humid climate, more frequent cleaning helps prevent mold and mildew buildup."
  },
  {
    question: "Do you use eco-friendly cleaning products?",
    answer: "Yes! All our cleaning solutions are biodegradable and safe for plants, pets, and the environment."
  },
  {
    question: "What if I'm not satisfied with the results?",
    answer: "Customer satisfaction is our #1 priority. If you're not completely happy with our work, let us know and we'll make it right. We stand behind every job we do."
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 glow-border">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="glow-text">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Got questions? We've got answers.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="glass-card rounded-xl px-6 border-none"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <span className="font-semibold text-lg pr-4">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
