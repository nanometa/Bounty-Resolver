import React from 'react';
import { Link } from 'react-router-dom';
import { SmokeBackground } from '../components/ui/SmokeBackground';
import FeatureShaderCards from '../components/ui/FeatureShaderCards';

function Landing() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Smoke Background */}
      <div className="fixed inset-0 z-0 opacity-50">
        <SmokeBackground smokeColor="#8B5CF6" />
      </div>

      {/* Navbar */}
      <nav className="nav-glass sticky top-0 z-50">
        <div className="w-full px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Bounty Resolver" className="w-16 h-16 object-contain logo-shimmer" />
            <div>
              <span className="font-heading font-bold text-lg text-white">Bounty Resolver</span>
              <span className="hidden md:block text-[10px] text-violet-400/60 -mt-1">GenLayer AI</span>
            </div>
          </div>
          <Link
            to="/app"
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm transition-all border border-violet-500/50"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="font-heading font-bold text-5xl md:text-7xl gradient-text mb-6 leading-tight">
          Bounty Resolver
        </h1>
        <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed mb-4">
          The first AI-judged bounty platform built on GenLayer.
          Create bounties, submit solutions, and let decentralized AI validators
          evaluate work quality and pick winners through on-chain consensus.
        </p>
        <p className="text-slate-500 text-base max-w-2xl mx-auto mb-12">
          No middlemen. No bias. Trustless judgment powered by multiple AI validators
          that fetch, read, and score submissions in real-time.
        </p>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 py-20 w-full">
        <h2 className="font-heading font-bold text-3xl text-white text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card-futuristic rounded-2xl p-6 text-center">
            <div className="text-3xl font-heading font-bold text-violet-400 mb-3">01</div>
            <h3 className="text-white font-medium mb-2">Create a Bounty</h3>
            <p className="text-slate-400 text-sm">
              Connect your wallet and post a task with a title, description, requirements, and reward points.
              You become the bounty owner — only you can trigger evaluation and close the bounty.
            </p>
          </div>
          <div className="card-futuristic rounded-2xl p-6 text-center">
            <div className="text-3xl font-heading font-bold text-violet-400 mb-3">02</div>
            <h3 className="text-white font-medium mb-2">Submit Solutions</h3>
            <p className="text-slate-400 text-sm">
              Workers submit a public URL (GitHub, deployed app, etc.) with a description.
              Multiple workers can compete. You cannot submit to your own bounty.
            </p>
          </div>
          <div className="card-futuristic rounded-2xl p-6 text-center">
            <div className="text-3xl font-heading font-bold text-violet-400 mb-3">03</div>
            <h3 className="text-white font-medium mb-2">AI Evaluation</h3>
            <p className="text-slate-400 text-sm">
              The bounty owner requests AI evaluation. GenLayer validators independently fetch the URL,
              read the real content, and score 0-100 via on-chain consensus. No single point of failure.
            </p>
          </div>
          <div className="card-futuristic rounded-2xl p-6 text-center">
            <div className="text-3xl font-heading font-bold text-violet-400 mb-3">04</div>
            <h3 className="text-white font-medium mb-2">Winner Selected</h3>
            <p className="text-slate-400 text-sm">
              Once submissions are evaluated, the bounty owner closes the bounty.
              AI judges pick the best submission through consensus, and reward points are stored on-chain.
            </p>
          </div>
        </div>
      </section>

      {/* Features — Shader Cards */}
      <section className="max-w-5xl mx-auto px-6 py-20 w-full">
        <h2 className="font-heading font-bold text-3xl text-white text-center mb-12">
          Why Bounty Resolver
        </h2>
        <FeatureShaderCards />
      </section>
      </div>
    </div>
  );
}

export default Landing;



