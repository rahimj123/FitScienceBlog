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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertSubscriberSchema } from "@shared/schema";

const subscribeFormSchema = insertSubscriberSchema.extend({
  privacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy",
  }),
});

type SubscribeFormValues = z.infer<typeof subscribeFormSchema>;

const NewsletterSignup = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeFormSchema),
    defaultValues: {
      email: "",
      name: "",
      interests: "all-topics",
      privacy: false,
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscribeFormValues) => {
      const { privacy, ...subscriberData } = data;
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriberData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to subscribe");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setIsSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: SubscribeFormValues) {
    subscribeMutation.mutate(data);
  }

  return (
    <section id="newsletter" className="py-16 bg-primary">
      <div className="container-custom">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-white">
              Stay Updated with FitScience Daily
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Subscribe to our newsletter and be the first to receive the latest
              insights, research findings, and technology reviews.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                <span className="text-blue-100">
                  Weekly curated content on healthcare innovation
                </span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                <span className="text-blue-100">
                  Exclusive interviews with industry experts
                </span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                <span className="text-blue-100">
                  Early access to research summaries and technology reviews
                </span>
              </li>
            </ul>
          </div>
          <div className="mt-10 lg:mt-0 lg:w-1/2 lg:pl-10">
            {isSubmitted ? (
              <div className="bg-white p-10 rounded-lg shadow-md text-center">
                <div className="text-6xl text-secondary mb-4">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                <p className="text-neutral-dark mb-4">
                  Your subscription has been confirmed. You'll start receiving our
                  newsletter with the latest healthcare insights and innovations.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setIsSubmitted(false)}
                >
                  Subscribe Another Email
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="you@example.com"
                              {...field}
                              className="px-4 py-3"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                              className="px-4 py-3"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="interests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Areas of interest</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value as string || "all-topics"}
                          >
                            <FormControl>
                              <SelectTrigger className="px-4 py-3">
                                <SelectValue placeholder="Select your interests" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all-topics">All Topics</SelectItem>
                              <SelectItem value="medical-tech">
                                Medical Technology
                              </SelectItem>
                              <SelectItem value="fitness">
                                Fitness & Wellness
                              </SelectItem>
                              <SelectItem value="mental-health">
                                Mental Health
                              </SelectItem>
                              <SelectItem value="research">
                                Research & Science
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="privacy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to receive emails and accept the{" "}
                              <a
                                href="#"
                                className="text-primary hover:underline"
                              >
                                Privacy Policy
                              </a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full py-3 px-4 bg-primary hover:bg-primary-dark"
                      disabled={subscribeMutation.isPending}
                    >
                      {subscribeMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <i className="fas fa-circle-notch fa-spin"></i>
                          Processing...
                        </span>
                      ) : (
                        "Subscribe to Newsletter"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
