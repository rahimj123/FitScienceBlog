import {
  Activity,
  Award,
  CalendarCheck,
  Clock3,
  Dumbbell,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
};

export type FeatureItem = {
  value: string;
  label: string;
};

export type ServiceItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  ctaLabel: string;
};

export type BenefitItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type TestimonialItem = {
  quote: string;
  name: string;
  detail: string;
};

export const navigation: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Weekly Goodness", href: "/weekly-wellness-goodness" },
  { label: "Benefits", href: "#benefits" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export const quickStats: FeatureItem[] = [
  { value: "Personalized", label: "coaching built around your life" },
  { value: "Beginner-friendly", label: "programming that feels approachable" },
  { value: "Sustainable", label: "habits designed for long-term health" },
];

export const services: ServiceItem[] = [
  {
    title: "1-on-1 Wellness Coaching",
    description:
      "Personalized coaching sessions designed around your goals, schedule, and current fitness level so progress feels realistic and achievable.",
    icon: UserRound,
    href: "/signup?service=1-on-1%20Wellness%20Coaching",
    ctaLabel: "Sign Up",
  },
  {
    title: "Fitness Guidance for Beginners",
    description:
      "Start with confidence through approachable exercise guidance that improves stamina, form, and consistency without overwhelm.",
    icon: Activity,
    href: "/signup?service=Fitness%20Guidance%20for%20Beginners",
    ctaLabel: "Sign Up",
  },
  {
    title: "Weight Loss Support",
    description:
      "Build a sustainable path to fat loss with practical habit coaching, clear progress markers, and compassionate accountability.",
    icon: Target,
    href: "/signup?service=Weight%20Loss%20Support",
    ctaLabel: "Sign Up",
  },
  {
    title: "Strength and Mobility Programs",
    description:
      "Develop strength, move better, and protect your long-term health with programs that balance mobility, posture, and resilience.",
    icon: Dumbbell,
    href: "/signup?service=Strength%20and%20Mobility%20Programs",
    ctaLabel: "Sign Up",
  },
  {
    title: "Healthy Lifestyle Coaching",
    description:
      "Improve daily routines around movement, recovery, nutrition habits, sleep, and stress management for whole-person wellbeing.",
    icon: Leaf,
    href: "/signup?service=Healthy%20Lifestyle%20Coaching",
    ctaLabel: "Sign Up",
  },
  {
    title: "Virtual Consultations",
    description:
      "Access expert guidance from anywhere with flexible online consultations that fit into a busy modern lifestyle.",
    icon: CalendarCheck,
    href: "/signup?service=Virtual%20Consultations",
    ctaLabel: "Sign Up",
  },
  {
    title: "Weekly Wellness Goodness",
    description:
      "A weekly wellness blog with practical tips, movement ideas, mindset reminders, and healthy habits you can actually implement.",
    icon: Award,
    href: "/weekly-wellness-goodness",
    ctaLabel: "Read The Blog",
  },
];

export const benefits: BenefitItem[] = [
  {
    title: "Personalized Guidance",
    description: "Every plan is adapted to your starting point, capacity, goals, and lifestyle demands.",
    icon: Sparkles,
  },
  {
    title: "Science-Based Approach",
    description: "Guidance is grounded in evidence, practical coaching principles, and sustainable health behaviors.",
    icon: ShieldCheck,
  },
  {
    title: "Sustainable Habits",
    description: "The focus is long-term change you can maintain, not short bursts of motivation or restriction.",
    icon: Clock3,
  },
  {
    title: "Beginner-Friendly Coaching",
    description: "Clear instruction and steady progress make it easier to begin, even if fitness feels intimidating.",
    icon: HeartPulse,
  },
  {
    title: "Accountability and Support",
    description: "Consistent encouragement, check-ins, and structure help you stay on track when life gets busy.",
    icon: Users,
  },
  {
    title: "Long-Term Wellbeing",
    description: "The goal is not only looking better, but moving better, feeling better, and aging with strength.",
    icon: Waves,
  },
];

export const testimonials: TestimonialItem[] = [
  {
    quote:
      "Working with Dr. Jindani gave me structure without making me feel judged. I have more energy, stronger habits, and for the first time my progress feels sustainable.",
    name: "Sarah M.",
    detail: "Client, wellness coaching",
  },
  {
    quote:
      "I started as a complete beginner and was nervous about exercise. The guidance was clear, professional, and realistic. I feel stronger, more mobile, and more confident every week.",
    name: "Daniel R.",
    detail: "Client, beginner fitness support",
  },
  {
    quote:
      "The biggest shift was consistency. Instead of another short-term plan, I learned how to build routines that actually fit my life and support my health long term.",
    name: "Priya K.",
    detail: "Client, lifestyle transformation",
  },
];

export const brand = {
  name: "Wellness with Dr. Jindani",
  heroImage:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  founderImage:
    "https://placehold.co/720x900/F4EFE6/234432?text=Replace+with+Dr.+Jindani+portrait",
};

export const credentials = [
  { label: "Qualification", value: "[Insert degree / credentials]" },
  { label: "Certification", value: "[Insert relevant certification]" },
  { label: "Experience", value: "[Insert years of client support]" },
];

export const socialLinks = {
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  email: "mailto:hello@wellnesswithdrjindani.com",
};

export const cta = {
  primary: "Book a Consultation",
  secondary: "Start Your Wellness Journey",
  final: "Book Your First Session",
};


export const badge = {
  icon: Award,
  text: "Science-backed wellness coaching for real life",
};
