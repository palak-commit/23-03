import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-8 py-20 px-4">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
          Welcome to <span className="text-indigo-600">TaskMaster!</span> 🏠
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The ultimate tool to organize your daily tasks, manage team groups, and boost your productivity effortlessly.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Link 
          to="/tasks" 
          className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 active:scale-95"
        >
          View Task List ➡️
        </Link>
        <Link 
          to="/groups" 
          className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-indigo-50 transition-all active:scale-95"
        >
          Explore Groups 👥
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-4">📝</div>
          <h3 className="font-bold text-lg mb-2">Smart Tasks</h3>
          <p className="text-gray-500 text-sm">Create and manage your tasks with intuitive UI.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-4">👥</div>
          <h3 className="font-bold text-lg mb-2">Team Groups</h3>
          <p className="text-gray-500 text-sm">Collaborate with your team members easily.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-4">🚀</div>
          <h3 className="font-bold text-lg mb-2">Fast & Secure</h3>
          <p className="text-gray-500 text-sm">Lightning fast performance and secure data.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
