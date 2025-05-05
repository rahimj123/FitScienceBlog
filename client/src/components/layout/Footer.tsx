import { Link } from "wouter";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-darkest">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center">
              <span className="text-white font-bold text-2xl">
                FitScience<span className="text-secondary">Daily</span>
              </span>
            </Link>
            <p className="mt-4 text-neutral-medium">
              Exploring the intersection of health, science, and innovation to
              address today's biggest healthcare challenges.
            </p>
            <div className="flex space-x-6 mt-8">
              <a
                href="#"
                className="text-neutral-medium hover:text-white transition-all"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f text-lg"></i>
              </a>
              <a
                href="#"
                className="text-neutral-medium hover:text-white transition-all"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a
                href="#"
                className="text-neutral-medium hover:text-white transition-all"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-lg"></i>
              </a>
              <a
                href="#"
                className="text-neutral-medium hover:text-white transition-all"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in text-lg"></i>
              </a>
              <a
                href="#"
                className="text-neutral-medium hover:text-white transition-all"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube text-lg"></i>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/" className="text-neutral-medium hover:text-white transition-all">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-neutral-medium hover:text-white transition-all">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/categories/medical-technology" className="text-neutral-medium hover:text-white transition-all">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-medium hover:text-white transition-all">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-medium hover:text-white transition-all">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg">Categories</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/categories/medical-technology"
                  className="text-neutral-medium hover:text-white transition-all"
                >
                  Medical Technology
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/fitness-wellness"
                  className="text-neutral-medium hover:text-white transition-all"
                >
                  Fitness & Wellness
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/mental-health"
                  className="text-neutral-medium hover:text-white transition-all"
                >
                  Mental Health
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/research-science"
                  className="text-neutral-medium hover:text-white transition-all"
                >
                  Research & Science
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/digital-health"
                  className="text-neutral-medium hover:text-white transition-all"
                >
                  Digital Health
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-dark">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-medium text-sm">
              &copy; {currentYear} FitScience Daily. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy-policy"
                className="text-sm text-neutral-medium hover:text-white transition-all"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-sm text-neutral-medium hover:text-white transition-all"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookie-policy"
                className="text-sm text-neutral-medium hover:text-white transition-all"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
          <div className="mt-6 text-xs text-neutral-medium text-center md:text-left">
            <p>
              This site contains affiliate links. We may earn a commission if
              you purchase through these links.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
