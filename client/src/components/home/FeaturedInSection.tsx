const FeaturedInSection = () => {
  const partners = [
    { name: "Medical Journal", logo: "https://tailwindui.com/img/logos/tuple-logo-gray-400.svg" },
    { name: "Health Tech Today", logo: "https://tailwindui.com/img/logos/mirage-logo-gray-400.svg" },
    { name: "MedTech Review", logo: "https://tailwindui.com/img/logos/statickit-logo-gray-400.svg" },
    { name: "Healthcare Innovations", logo: "https://tailwindui.com/img/logos/transistor-logo-gray-400.svg" },
    { name: "Science Daily", logo: "https://tailwindui.com/img/logos/workcation-logo-gray-400.svg" },
    { name: "MedTech Insider", logo: "https://tailwindui.com/img/logos/savvycal-logo-gray-400.svg" },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">
        <h2 className="text-center text-lg font-medium text-neutral-dark mb-8">
          As Featured In
        </h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="col-span-1 flex justify-center items-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
            >
              <img
                className="h-8"
                src={partner.logo}
                alt={partner.name}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedInSection;
