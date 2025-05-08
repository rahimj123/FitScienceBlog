import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <>
      <div className="bg-primary text-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">About FitScience Daily</h1>
            <p className="text-xl">
              Bridging the gap between healthcare challenges and innovative
              technological solutions
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg mb-4">
              At FitScience Daily, we're dedicated to exploring the
              intersection of healthcare challenges and technological
              innovations. Our mission is to provide insightful, research-backed
              content that helps professionals, researchers, and enthusiasts
              stay informed about the rapidly evolving healthcare technology
              landscape.
            </p>
            <p className="text-lg mb-6">
              We believe that technology has the power to transform healthcare
              delivery, improve patient outcomes, and address some of the most
              pressing challenges facing the industry today.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
          <div className="lg:pl-12">
            <img
              src="https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              alt="Healthcare professionals discussing technology"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8 text-center">What We Cover</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <i className="fas fa-heartbeat text-2xl text-primary"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Medical Innovations</h3>
              <p className="text-neutral-dark">
                Cutting-edge medical technologies and devices that are
                changing how we diagnose and treat diseases.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <i className="fas fa-mobile-alt text-2xl text-secondary"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Digital Health</h3>
              <p className="text-neutral-dark">
                Mobile health applications, telehealth platforms, and other
                digital tools revolutionizing healthcare delivery.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <i className="fas fa-brain text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">AI & Machine Learning</h3>
              <p className="text-neutral-dark">
                How artificial intelligence is transforming diagnostics,
                treatment planning, and healthcare operations.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <i className="fas fa-dna text-2xl text-orange-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Research & Breakthroughs</h3>
              <p className="text-neutral-dark">
                The latest research findings and scientific breakthroughs
                in healthcare and medical science.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Team collaborating"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold mb-6">Our Team</h2>
              <p className="text-lg mb-4">
                FitScience Daily is brought to you by a diverse team of healthcare
                professionals, technology experts, and science writers who are
                passionate about the future of healthcare.
              </p>
              <p className="text-lg mb-4">
                Our contributors include physicians, researchers, health IT
                specialists, and industry analysts who bring their unique
                perspectives and expertise to our content.
              </p>
              <p className="text-lg">
                We strive to provide balanced, evidence-based reporting that
                highlights both the potential and limitations of emerging
                healthcare technologies.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            Be part of our growing community of healthcare innovators,
            technologists, and forward-thinkers. Subscribe to our newsletter
            to stay updated on the latest developments.
          </p>
          <Button asChild size="lg">
            <Link href="/#newsletter">Subscribe to Our Newsletter</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default About;
