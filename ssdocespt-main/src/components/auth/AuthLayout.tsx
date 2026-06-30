import { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showToggle?: boolean;
  toggleText?: string;
  onToggle?: () => void;
}

export const AuthLayout = ({
  children,
  title,
  subtitle,
  showToggle,
  toggleText,
  onToggle,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg hover:opacity-90 transition-opacity mb-4">
            SS
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>

        {/* Main content */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-8 mb-6">
          {children}
        </div>

        {/* Toggle link */}
        {showToggle && toggleText && onToggle && (
          <div className="text-center">
            <button
              type="button"
              onClick={onToggle}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {toggleText}
            </button>
          </div>
        )}

        {/* Footer links */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-gray-500">
          <Link to="/" className="hover:text-gray-300 transition-colors">
            Home
          </Link>
          <Link to="/about" className="hover:text-gray-300 transition-colors">
            About
          </Link>
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="hover:text-gray-300 transition-colors">
            Privacy
          </a>
        </div>
      </div>
    </div>
  );
};
