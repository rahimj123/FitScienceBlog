import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { insertContactMessageSchema } from "@shared/schema";

const contactFormSchema = insertContactMessageSchema;

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: (data: ContactFormValues) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });
      setIsSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ContactFormValues) {
    contactMutation.mutate(data);
  }

  return (
    <>
      <div className="bg-primary text-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl">
              Have questions, feedback, or suggestions? We'd love to hear from you.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
            <p className="text-lg mb-6">
              Whether you have a question about our content, want to suggest a topic for us to cover, 
              or are interested in collaborating with us, we're here to help.
            </p>
            
            <div className="mt-8 space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center mr-4">
                  <i className="fas fa-envelope text-white"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Email Us</h3>
                  <p className="text-neutral-dark">info@fitsciencedaily.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center mr-4">
                  <i className="fas fa-map-marker-alt text-white"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Our Location</h3>
                  <p className="text-neutral-dark">123 Health Innovation Avenue<br />San Francisco, CA 94158</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-400 flex items-center justify-center mr-4">
                  <i className="fas fa-share-alt text-white"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Connect With Us</h3>
                  <div className="flex mt-2 space-x-4">
                    <a href="#" className="text-neutral-dark hover:text-primary transition-all">
                      <i className="fab fa-twitter text-xl"></i>
                    </a>
                    <a href="#" className="text-neutral-dark hover:text-primary transition-all">
                      <i className="fab fa-facebook text-xl"></i>
                    </a>
                    <a href="#" className="text-neutral-dark hover:text-primary transition-all">
                      <i className="fab fa-linkedin text-xl"></i>
                    </a>
                    <a href="#" className="text-neutral-dark hover:text-primary transition-all">
                      <i className="fab fa-instagram text-xl"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-4">For Business Inquiries</h3>
              <p className="text-neutral-dark">
                If you're interested in advertising with us, sponsored content, or other business opportunities,
                please email us at <span className="text-primary">partnerships@fitsciencedaily.com</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="text-6xl text-secondary mb-4">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                <p className="text-neutral-dark mb-6">
                  Your message has been sent successfully. We'll get back to you as soon as possible.
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help you?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your message here..." 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={contactMutation.isPending}
                    >
                      {contactMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <i className="fas fa-circle-notch fa-spin"></i>
                          Sending...
                        </span>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </Form>
              </>
            )}
            
            {/* Advertisement */}
            <div className="mt-8 ad-placeholder">
              <p className="text-sm text-center text-neutral-dark">
                Sponsored Content
              </p>
              <div className="google-ad mt-2">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block" }}
                  data-ad-client={process.env.GOOGLE_ADSENSE_ID || "ca-pub-xxxxxxxxxxxxxxxx"}
                  data-ad-slot="1234567890"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
                <script>
                  (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-lg text-neutral-dark mt-4">
              Find answers to common questions about FitScience Daily
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">
                <i className="fas fa-question-circle text-primary mr-2"></i>
                How can I contribute an article?
              </h3>
              <p className="text-neutral-dark">
                We welcome guest contributions from healthcare professionals and technology experts. 
                Please send your pitch to contributors@fitsciencedaily.com with your expertise and topic ideas.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">
                <i className="fas fa-question-circle text-primary mr-2"></i>
                Do you offer advertising opportunities?
              </h3>
              <p className="text-neutral-dark">
                Yes, we offer various advertising options including display ads, sponsored content, and newsletter placements. 
                Contact our partnerships team for more information.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">
                <i className="fas fa-question-circle text-primary mr-2"></i>
                How often do you publish new content?
              </h3>
              <p className="text-neutral-dark">
                We publish new articles 3-5 times per week, focusing on quality, research-backed content about 
                healthcare technology and innovation.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">
                <i className="fas fa-question-circle text-primary mr-2"></i>
                How can I report an issue with the website?
              </h3>
              <p className="text-neutral-dark">
                If you encounter any technical issues or have feedback about our website, please use the contact form 
                above or email support@fitsciencedaily.com.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
