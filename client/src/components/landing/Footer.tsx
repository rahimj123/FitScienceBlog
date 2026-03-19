import { brand, navigation, socialLinks } from "./content";

function resolveHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href;
}

export function LandingFooter() {
  return (
    <footer className="bg-[#102419] py-10 text-white">
      <div className="container-custom flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-display text-2xl">{brand.name}</div>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/70">
            Professional, supportive wellness coaching focused on sustainable strength, healthier
            habits, and long-term wellbeing.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-white/75">
          {navigation.map((item) => (
            <a key={item.href} href={resolveHref(item.href)} className="transition hover:text-[#d7c49e]">
              {item.label}
            </a>
          ))}
          <a href={socialLinks.linkedinRahim} className="transition hover:text-[#d7c49e]">
            Rahim LinkedIn
          </a>
          <a href={socialLinks.linkedinShireen} className="transition hover:text-[#d7c49e]">
            Shireen LinkedIn
          </a>
        </div>
      </div>
      <div className="container-custom mt-8 border-t border-white/10 pt-6 text-sm text-white/55">
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </div>
    </footer>
  );
}
