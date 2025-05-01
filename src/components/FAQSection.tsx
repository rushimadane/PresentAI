
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the AI create presentations?",
    answer: "Our AI analyzes your content, understands the context and key points, and then applies design principles to create visually appealing slides. It selects appropriate layouts, typography, colors, and suggests relevant images based on your content."
  },
  {
    question: "Can I customize the AI-generated designs?",
    answer: "Absolutely! While our AI creates beautiful presentations automatically, you have full control to customize every aspect. You can change layouts, colors, fonts, images, and more to match your preferences or brand guidelines."
  },
  {
    question: "What file formats can I export my presentations to?",
    answer: "You can export your presentations to PDF, PowerPoint (PPTX), and HTML formats. You can also present directly from our platform with our built-in presentation mode."
  },
  {
    question: "Can I import my existing presentations?",
    answer: "Yes, you can import PowerPoint (PPTX) files, and our AI will enhance the design while preserving your content. You can also import content from Google Docs, Word, or even plain text."
  },
  {
    question: "Is my data secure?",
    answer: "We take data security very seriously. All your presentations and data are encrypted both in transit and at rest. We don't share your content with third parties, and our AI training doesn't use your private content."
  },
  {
    question: "Can I collaborate with my team?",
    answer: "Yes, our Pro and Enterprise plans include collaboration features. You can invite team members to view and edit presentations, leave comments, and work together in real-time."
  }
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about PresentAI.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-xl font-medium text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Have more questions? We're here to help.
          </p>
          <a href="#" className="text-primary font-medium hover:underline mt-2 inline-block">
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
