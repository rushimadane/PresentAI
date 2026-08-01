import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need an API key?",
    answer: "No. The app ships with a built-in Gemini key, so you can generate decks right away. If you'd rather use your own key, there's an optional field for it on the Create page.",
  },
  {
    question: "Where do the slide images come from?",
    answer: "Gemini writes a short image description for each slide, and that description is turned into an image using Pollinations, a free image generator that needs no key. You can regenerate any image or switch its style.",
  },
  {
    question: "Can I edit the deck after it's generated?",
    answer: "Yes. You can edit every slide's title, body text, and image prompt inline, regenerate individual images, and change the image style per slide.",
  },
  {
    question: "How do I get my slides out?",
    answer: "The Download button saves your deck as a JSON file. A PowerPoint/PDF export is on the roadmap.",
  },
  {
    question: "Which AI model does it use?",
    answer: "Text is generated with Google's Gemini (the current Flash model). Images are generated separately by Pollinations.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-16 md:py-24 bg-gray-50 border-b border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold mb-8">Questions</h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-base font-medium text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-600 text-sm leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
