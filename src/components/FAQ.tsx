import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What areas do you service?",
    answer: "We proudly serve all of Broward County, including Fort Lauderdale, Hollywood, Pembroke Pines, Coral Springs, Miramar, and surrounding areas.",
  },
  {
    question: "How long does a typical service take?",
    answer: "Most residential services take 1-3 hours depending on the size and condition of the area. We'll provide an estimated timeframe when you book.",
  },
  {
    question: "Do I need to be home during the service?",
    answer: "No, you don't need to be home as long as we have access to water and the areas to be cleaned. We'll communicate throughout the process.",
  },
  {
    question: "Are your cleaning products eco-friendly?",
    answer: "Yes! We use biodegradable, eco-safe cleaning solutions that are tough on dirt but gentle on the environment, your property, and your family.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept cash, all major credit cards, Venmo, Zelle, and Cash App for your convenience.",
  },
  {
    question: "Do you offer recurring services?",
    answer: "Absolutely! We offer monthly, quarterly, and seasonal service plans with discounted rates for regular customers.",
  },
  {
    question: "What if I'm not satisfied with the results?",
    answer: "Your satisfaction is our priority. If you're not happy with the results, we'll come back and make it right at no additional charge.",
  },
  {
    question: "Do you provide free estimates?",
    answer: "Yes! We offer free, no-obligation estimates. You can book through our website or call us at (954) 865-6205.",
  },
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 3-5 days in advance, but we often have same-week availability. Contact us to check our schedule!",
  },
  {
    question: "Are you licensed and insured?",
    answer: "Yes, RWDetailz is fully licensed and insured for your peace of mind and protection.",
  },
];

const FAQ = () => {
  return (
    <section className="py-24 px-4 min-h-screen">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="glow-text">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Got questions? We've got answers!
          </p>
        </div>

        <div className="glass-card rounded-xl p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a
            href="tel:9548656205"
            className="text-primary hover:underline font-semibold text-lg"
          >
            Call us at (954) 865-6205
          </a>
          <p className="text-muted-foreground mt-2">or</p>
          <a
            href="mailto:rwdetailz@gmail.com"
            className="text-primary hover:underline font-semibold text-lg"
          >
            rwdetailz@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
