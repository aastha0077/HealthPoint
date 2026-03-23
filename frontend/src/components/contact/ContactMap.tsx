interface ContactMapProps {
  title?: string;
  address: string;
  embedUrl?: string;
  className?: string;
}

function ContactMap({
  title = "Find Us",
  address,
  embedUrl,
  className = "",
}: ContactMapProps) {
  // Default map URL for Kathmandu, Nepal (since you're located there)
  const defaultMapUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.4912674474985!2d85.31398931506197!3d27.70898798279729!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19b59f66ab4f%3A0x4cd9b4c0b8b9c4c6!2sKathmandu%2C%20Nepal!5e0!3m2!1sen!2snp!4v1625647891234!5m2!1sen!2snp";

  const mapUrl = embedUrl || defaultMapUrl;

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      <div className="p-6 pb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 text-sm mb-4">{address}</p>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
          <span className="text-sm text-gray-600">Hospital Location</span>
        </div>
      </div>

      <div className="relative">
        <iframe
          src={mapUrl}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
          title="Hospital Location Map"
        ></iframe>

        {/* Overlay for better interaction */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 to-transparent"></div>
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Click and drag to explore</span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              address
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

export { ContactMap };
