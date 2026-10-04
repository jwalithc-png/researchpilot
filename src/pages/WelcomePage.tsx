import React from 'react';
import { MessageSquare, Brain, FileText } from 'lucide-react';
import { KnowledgeNetworkScene } from '../3d/KnowledgeNetworkScene';

interface WelcomePageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onNavigateToAuth }) => {
  return (
    <div className="relative min-h-screen bg-[#060B17] text-white font-sans overflow-x-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <KnowledgeNetworkScene />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B17]/40 via-transparent to-[#060B17]/90 pointer-events-none" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        
        {/* Navbar */}
        <nav className="w-full p-6 flex justify-between items-center pointer-events-auto">
          <div className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-cyan-400">Research</span>Pilot
          </div>
          <button 
            onClick={() => onNavigateToAuth('login')}
            className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Sign In
          </button>
        </nav>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-10 pb-20 pointer-events-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70">
              Turn a Research Question into an <span className="text-cyan-400">Organized Research Workflow</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              ResearchPilot uses AI to analyze academic papers, identify research gaps, and build structured research plans — so you can focus on discovery.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => onNavigateToAuth('register')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#060B17] font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                Start Research
              </button>
              <button 
                onClick={() => onNavigateToAuth('login')}
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 transition-colors font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </main>

        {/* How It Works Section */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-24 pointer-events-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-[#0f172a]/90 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif">Ask</h3>
              <p className="text-gray-400 leading-relaxed">
                Define your research question and upload papers to begin the process.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-[#0f172a]/90 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 text-blue-500">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif">Analyze</h3>
              <p className="text-gray-400 leading-relaxed">
                AI analyzes papers, finds gaps, compares methodologies, and extracts insights.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-[#0f172a]/90 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif">Plan</h3>
              <p className="text-gray-400 leading-relaxed">
                Get a structured research plan with actionable tasks to guide your work.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full text-center pb-24 pointer-events-auto">
          <button 
            onClick={() => onNavigateToAuth('register')}
            className="px-8 py-4 rounded-full bg-white text-[#060B17] font-semibold hover:bg-gray-200 transition-colors"
          >
            Start Your Research Now
          </button>
        </section>

        {/* Footer */}
        <footer className="w-full p-6 text-center text-gray-500 text-sm mt-auto pointer-events-auto">
          © 2026 ResearchPilot. All rights reserved.
        </footer>
      </div>
    </div>
  );
};
