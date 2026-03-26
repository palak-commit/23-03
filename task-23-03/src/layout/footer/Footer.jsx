function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">TaskMaster</h3>
          <p className="text-gray-400 leading-relaxed">Organize your tasks and groups efficiently. 🚀</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-indigo-400 transition-colors">Home</a></li>
            <li><a href="/tasks" className="hover:text-indigo-400 transition-colors">Tasks</a></li>
            <li><a href="/groups" className="hover:text-indigo-400 transition-colors">Groups</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Support</h4>
          <p className="text-gray-400">Email: help@taskmaster.com</p>
          <div className="flex gap-4 text-2xl pt-2">
            <span className="cursor-pointer hover:scale-110 transition-transform">🌐</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">🐦</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">📸</span>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center">
        <p className="text-gray-500 text-sm">&copy; {currentYear} TaskMaster App. Made with ❤️ in India. જય શ્રી કૃષ્ણ 🤍</p>
      </div>
    </footer>
  );
}

export default Footer;