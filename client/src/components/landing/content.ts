import {
  Activity,
  Award,
  Brain,
  CalendarCheck,
  ClipboardList,
  Dumbbell,
  FileCheck2,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Sparkles,
  Stethoscope,
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

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  focus: string;
  credentials: string[];
  linkedin: string;
  image: string;
};

export type ProcessStep = {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type ServiceGroup = {
  title: string;
  description: string;
  items: {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    ctaLabel: string;
  }[];
};

export type AudienceItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type IntakeItem = {
  title: string;
  description: string;
};

export type DisclaimerItem = {
  title: string;
  description: string;
};

export type PathwayOption = {
  title: string;
  subtitle: string;
  points: string[];
  href: string;
};

export type TestimonialItem = {
  quote: string;
  name: string;
  detail: string;
};

export const navigation: NavItem[] = [
  { label: "Experts", href: "#experts" },
  { label: "How It Works", href: "#process" },
  { label: "Pathways", href: "#pathways" },
  { label: "Memberships", href: "#memberships" },
  { label: "Services", href: "#services" },
  { label: "Corporates", href: "#corporates" },
  { label: "Trust & Safety", href: "#trust" },
  { label: "Contact", href: "#contact" },
];

export const quickStats: FeatureItem[] = [
  { value: "Two experts", label: "coordinated guidance across coaching and physician review" },
  { value: "Science-informed", label: "wellness support shaped by practical and medical perspective" },
  { value: "Whole-person", label: "mind, body, lifestyle, movement, and wellbeing" },
];

export const teamMembers: TeamMember[] = [
  {
    name: "Dr. Rahim Jindani",
    role: "Fitness and Wellness Coach",
    bio: "Dr. Rahim Jindani combines a material science background focused on health and wellbeing with NASM personal training credentials to guide clients through movement, strength, mobility, and practical lifestyle change.",
    focus: "Exercise coaching, movement quality, beginner training, strength, mobility, and sustainable wellness habits.",
    credentials: [
      "Material science specialist focused on health and wellbeing",
      "National Academy of Sports Medicine (NASM) Personal Trainer",
      "Beginner-friendly coaching and long-term habit support",
    ],
    linkedin: "https://www.linkedin.com/in/rj987/",
    image: "https://placehold.co/720x900/F4EFE6/234432?text=Replace+with+Dr.+Rahim+Jindani",
  },
  {
    name: "Dr. Shireen Jindani",
    role: "Physician-Guided Wellness Review",
    bio: "Dr. Shireen Jindani is an MD in Internal Medicine who supports clients seeking a deeper and more medically informed wellness review through formal physician consultation and thoughtful healthy lifestyle guidance.",
    focus: "1-on-1 physician consultation, healthy lifestyle coaching, medical wellness oversight, and lab-informed review where clinically appropriate.",
    credentials: [
      "MD, Internal Medicine Doctor",
      "Physician consultation for advanced wellness pathway clients",
      "Medical review and lab guidance only after formal consultation",
    ],
    linkedin: "https://www.linkedin.com/in/shireenjindani",
    image: "https://placehold.co/720x900/EEF2EC/234432?text=Replace+with+Dr.+Shireen+Jindani",
  },
];

export const serviceGroups: ServiceGroup[] = [
  {
    title: "Fitness and Wellness Coaching with Dr. Rahim",
    description:
      "A practical coaching pathway for clients who want expert movement guidance, a strong foundation, and a sustainable plan they can follow with confidence.",
    items: [
      {
        title: "Beginner Fitness Coaching",
        description: "A supportive start for adults who want expert guidance without intimidation or complexity.",
        icon: Activity,
        href: "/signup?service=Beginner%20Fitness%20Coaching",
        ctaLabel: "Choose this pathway",
      },
      {
        title: "Strength and Mobility Guidance",
        description: "Build better movement quality, resilience, and physical confidence through structured progression.",
        icon: Dumbbell,
        href: "/signup?service=Strength%20and%20Mobility%20Guidance",
        ctaLabel: "Choose this pathway",
      },
      {
        title: "Exercise Programming",
        description: "Personalized exercise structure aligned to your goals, schedule, and current level.",
        icon: CalendarCheck,
        href: "/signup?service=Exercise%20Programming",
        ctaLabel: "Choose this pathway",
      },
      {
        title: "Sustainable Habit Support",
        description: "Build repeatable routines around movement, recovery, and everyday health behavior.",
        icon: Leaf,
        href: "/signup?service=Sustainable%20Habit%20Support",
        ctaLabel: "Choose this pathway",
      },
      {
        title: "General Wellness Coaching",
        description: "Whole-person coaching focused on consistency, energy, mobility, and healthier living.",
        icon: Waves,
        href: "/signup?service=General%20Wellness%20Coaching",
        ctaLabel: "Choose this pathway",
      },
    ],
  },
  {
    title: "Advanced Wellness Pathway",
    description:
      "A higher-touch collaborative experience for clients who want coordinated support that may include physician consultation and a broader wellness review.",
    items: [
      {
        title: "Mind, Body and Spirit Module",
        description: "A broader wellness lens that supports behavior, mindset, routine, and overall wellbeing.",
        icon: Brain,
        href: "/signup?service=Mind%20Body%20and%20Spirit%20Module",
        ctaLabel: "Request full wellness review",
      },
      {
        title: "Healthy Lifestyle Coaching Module",
        description: "Lifestyle-focused coaching for clients seeking more structured guidance across daily habits and health behaviors.",
        icon: HeartPulse,
        href: "/signup?service=Healthy%20Lifestyle%20Coaching%20Module",
        ctaLabel: "Request full wellness review",
      },
      {
        title: "Physician-Led Internal Medicine Consultation",
        description: "A formal 1-on-1 consultation with Dr. Shireen when physician review is appropriate or requested.",
        icon: Stethoscope,
        href: "/signup?service=Physician-Led%20Internal%20Medicine%20Consultation",
        ctaLabel: "Request full wellness review",
      },
      {
        title: "Lab-Informed Wellness Review",
        description: "Screening labs are considered only after physician consultation and only when clinically appropriate.",
        icon: FileCheck2,
        href: "/signup?service=Lab-Informed%20Wellness%20Review",
        ctaLabel: "Request full wellness review",
      },
      {
        title: "Coordinated Wellness Support",
        description: "A connected experience that helps clients avoid fragmented guidance across movement and medical review.",
        icon: Users,
        href: "/signup?service=Coordinated%20Wellness%20Support",
        ctaLabel: "Request full wellness review",
      },
    ],
  },
];

export const processSteps: ProcessStep[] = [
  {
    step: "Step 1",
    title: "Join and complete intake",
    description:
      "New clients create an account, complete intake details, and submit pre-exercise screening so the team can understand goals, history, and readiness.",
    icon: ClipboardList,
  },
  {
    step: "Step 2",
    title: "Begin the right pathway",
    description:
      "Clients either begin the exercise and wellness pathway with Rahim or request the more advanced full wellness review pathway.",
    icon: Activity,
  },
  {
    step: "Step 3",
    title: "Add physician consultation when needed",
    description:
      "If a deeper medical wellness review is appropriate, a 1-on-1 consultation is scheduled with Dr. Shireen Jindani.",
    icon: Stethoscope,
  },
  {
    step: "Step 4",
    title: "Receive coordinated next steps",
    description:
      "After physician review, screening labs may be recommended when appropriate, and the client receives a tailored wellness plan with coordinated guidance.",
    icon: Sparkles,
  },
];

export const pathwayOptions: PathwayOption[] = [
  {
    title: "Fitness Pathway",
    subtitle: "For clients who want focused exercise, movement, and practical wellness coaching with Dr. Rahim.",
    points: [
      "Beginner-friendly exercise and movement guidance",
      "Strength, mobility, and coaching support",
      "Sustainable habit development and accountability",
      "Wellness-focused coaching without physician review unless separately requested",
    ],
    href: "/signup?service=Fitness%20Pathway",
  },
  {
    title: "Full Wellness Pathway",
    subtitle: "For clients who want coaching plus the option of a more medically informed review pathway.",
    points: [
      "Includes Rahim-led coaching as the practical foundation",
      "May include physician consultation with Dr. Shireen",
      "Expanded wellness history and deeper review flow",
      "Screening labs only after physician consultation and clinical judgment",
    ],
    href: "/signup?service=Full%20Wellness%20Pathway",
  },
];

export const audienceItems: AudienceItem[] = [
  {
    title: "Beginners starting exercise",
    description: "People who want a calm, professional entry point into movement and fitness.",
    icon: Activity,
  },
  {
    title: "Busy professionals",
    description: "Clients who need structured, realistic guidance that fits around a demanding schedule.",
    icon: CalendarCheck,
  },
  {
    title: "Adults seeking sustainable change",
    description: "People who want healthier routines they can actually maintain over time.",
    icon: Leaf,
  },
  {
    title: "Clients wanting deeper health review",
    description: "Those who want both fitness guidance and access to physician-led wellness review when appropriate.",
    icon: HeartPulse,
  },
  {
    title: "People who value coordinated support",
    description: "Clients looking for one connected wellness experience instead of fragmented advice.",
    icon: Users,
  },
  {
    title: "Adults who want high-trust guidance",
    description: "Individuals who want a science-informed, human, premium approach to whole-person wellness.",
    icon: ShieldCheck,
  },
];

export const intakeItems: IntakeItem[] = [
  {
    title: "Account signup",
    description: "Clients begin with a simple account setup so the team can organize intake, communication, and next steps.",
  },
  {
    title: "Intake questionnaire",
    description: "A structured intake form helps clarify goals, current lifestyle, history, and areas of support needed.",
  },
  {
    title: "Pre-exercise screening form",
    description: "Every new coaching client completes a pre-exercise screening to support safe and appropriate guidance.",
  },
  {
    title: "Optional expanded wellness history",
    description: "Clients choosing advanced services may complete an expanded wellness history before physician consultation.",
  },
];

export const disclaimerItems: DisclaimerItem[] = [
  {
    title: "Coaching is educational and wellness-focused",
    description: "Exercise and wellness coaching is designed to support healthier behavior, movement, and informed decision-making.",
  },
  {
    title: "Coaching does not replace medical care",
    description: "Fitness coaching is not a substitute for medical diagnosis, individualized treatment, or urgent care.",
  },
  {
    title: "Physician review requires formal consultation",
    description: "Medical recommendations are only provided through a formal physician consultation with Dr. Shireen Jindani.",
  },
  {
    title: "Labs are considered only when appropriate",
    description: "Screening labs are ordered or recommended only after physician review and only when clinically appropriate.",
  },
  {
    title: "Some clients may need additional clearance",
    description: "Clients with complex conditions, concerning symptoms, or special medical considerations may be referred for appropriate medical clearance.",
  },
];

export const testimonials: TestimonialItem[] = [
  {
    quote:
      "What stood out most was how thoughtful the process felt. The coaching was practical, professional, and tailored to real life rather than extremes.",
    name: "Placeholder Client A",
    detail: "Fitness pathway client",
  },
  {
    quote:
      "I appreciated that the team clearly explained what was coaching support and what would require formal physician review. It felt credible and very well coordinated.",
    name: "Placeholder Client B",
    detail: "Advanced wellness pathway client",
  },
  {
    quote:
      "The approach felt premium but human. I had structure for movement and healthier routines, and I never felt overwhelmed or pushed into unrealistic goals.",
    name: "Placeholder Client C",
    detail: "Wellness coaching client",
  },
];

export const brand = {
  name: "Wellness with Dr. Jindani",
  heroImage:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80",
};

export const socialLinks = {
  email: "mailto:hello@wellnesswithdrjindani.com",
  linkedinRahim: "https://www.linkedin.com/in/rj987/",
  linkedinShireen: "https://www.linkedin.com/in/shireenjindani",
};

export const cta = {
  primary: "Book a Wellness Consultation",
  secondary: "Start Your Fitness Journey",
  finalPrimary: "Choose Fitness Coaching",
  finalSecondary: "Choose Full Wellness Review",
};

export const badge = {
  icon: Award,
  text: "Collaborative wellness guidance across coaching and physician-informed review",
};
