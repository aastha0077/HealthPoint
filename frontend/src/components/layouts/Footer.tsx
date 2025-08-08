import logo from "../../assets/image.png";

function Footer() {
  return (
    <footer className="bg-red-900 text-white mt-20 px-6 py-10">
      <div className="max-w-screen-xl mx-auto">
        {/* Top Heading */}
        <div className="text-center mb-10">
          <h4 className="text-xl font-light">
            With PLU, you're never alone on the journey to recovery!
          </h4>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            <img src={logo} alt="Logo" className="mb-4 w-32" />
            <p className="text-red-300 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Reiciendis saepe magnam assumenda fugit tempora? Quas ea saepe
              quasi non recusandae consequuntur placeat aliquam perspiciatis
              vitae.
            </p>
          </div>

          {/* Help Center */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase">
              Help Center
            </h2>
            <ul className="space-y-2 text-red-300 text-sm">
              <li>
                <a href="#" className="hover:underline hover:text-red-200">
                  Discord Server
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-red-200">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-red-200">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-red-200">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase">Legal</h2>
            <ul className="space-y-2 text-red-300 text-sm">
              <li>
                <a href="#" className="hover:underline hover:text-red-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-red-200">
                  Licensing
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-red-200">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase">Contact Us</h2>
            <ul className="space-y-2 text-red-300 text-sm">
              <li>
                <a href="#" className="hover:underline hover:text-red-200">
                  977-9849000000
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-red-200">
                  facebook.com/lmu
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-red-200">
                  x.com/twitter/lmu
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-red-200">
                  instagram.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-red-700 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between">
          <span className="text-sm text-red-300 text-center md:text-left">
            © 2023 Public Lumbini United Hospital. All Rights Reserved.
          </span>

          {/* Social Icons */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            {/* You can replace these with icon components from `lucide-react` if you're using Shadcn */}
            <a href="#" className="hover:text-white text-red-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0C4.477 0 0 4.48 0 10c0 4.991 3.657 9.128 8.438 9.877v-6.99H5.898v-2.887h2.54V7.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.772-1.63 1.562v1.875h2.773l-.443 2.887h-2.33v6.99C16.343 19.127 20 14.991 20 10c0-5.52-4.477-10-10-10z" />
              </svg>
            </a>
            {/* Add other social icons here */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
