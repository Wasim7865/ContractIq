import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Plus, FileText, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="bg-teal-600 text-white p-2 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Contract<span className="text-teal-600">IQ</span>
              </span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/new"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  New Analysis
                </Link>

                <div className="h-6 w-px bg-gray-200" />

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium border border-gray-200">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline font-medium">{user.full_name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
