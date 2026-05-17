export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8 px-6 md:px-16 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-2">
          <h2 className="font-serif text-2xl font-bold mb-4">LexCam</h2>
          <p className="text-gray-300 text-sm max-w-sm">
            Empowering citizens through accessible legal knowledge and connections.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-[#F3A754]">Language</h4>
          <p className="text-sm text-gray-300">FR | EN</p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-[#F3A754]">Links</h4>
          <div className="flex flex-col gap-3 text-sm text-gray-300">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 border-t border-white/10 text-center text-sm text-gray-400">
        © 2026 LexCam. Legal Empowerment for Cameroon.
      </div>
    </footer>
  );
}
