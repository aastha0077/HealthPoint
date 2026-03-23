interface ContactInfoItem {
  icon: React.ReactNode;
  title: string;
  details: string[];
  link?: string;
}

interface ContactInfoProps {
  hospitalName?: string;
  items: ContactInfoItem[];
}

function ContactInfo({
  hospitalName = "Public Lumbini United Hospital",
  items,
}: ContactInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Get in Touch
        </h2>
        <p className="text-gray-600 text-sm">
          We're here to help. Reach out to us through any of the following
          channels.
        </p>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                {item.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-800 mb-1">
                {item.title}
              </h3>
              <div className="space-y-1">
                {item.details.map((detail, detailIndex) => (
                  <p key={detailIndex} className="text-gray-600 text-sm">
                    {item.link && detailIndex === 0 ? (
                      <a
                        href={item.link}
                        className="text-red-600 hover:text-red-700 hover:underline"
                        target={
                          item.link.startsWith("http") ? "_blank" : "_self"
                        }
                        rel={
                          item.link.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {detail}
                      </a>
                    ) : (
                      detail
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {hospitalName}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Providing quality healthcare services to our community since 2010.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="#"
              className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 hover:bg-red-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 hover:bg-red-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 hover:bg-red-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.160 1.219-5.160s-.219-.438-.219-1.085c0-1.016.219-1.775.877-1.775.416 0 .615.219.615.877 0 .438-.219 1.094-.219 1.532s.219.877.656.877c.753 0 1.271-.793 1.271-1.944 0-1.016-.753-1.775-1.826-1.775-1.241 0-1.967.877-1.967 1.775 0 .438.199.753.438.753.219 0 .438-.438.438-.753 0-.316-.199-.657-.199-.877 0-.219.199-.438.438-.438.438 0 .657.438.657.877 0 1.532-1.271 2.767-2.767 2.767-1.775 0-3.111-1.532-3.111-3.307 0-1.775 1.271-3.111 3.111-3.111 1.496 0 2.767 1.271 2.767 2.767 0 .438-.199.877-.438 1.271-.219.438-.219.877-.219 1.316 0 .438.219.877.657.877.438 0 .657-.438.657-.877 0-.438-.219-.877-.219-1.316 0-.438.219-.877.438-1.271.219-.438.438-.877.438-1.271 0-1.496-1.271-2.767-2.767-2.767z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ContactInfo, type ContactInfoItem };
