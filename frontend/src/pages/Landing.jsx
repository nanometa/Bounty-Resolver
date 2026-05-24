import React from 'react';
import { Link } from 'react-router-dom';
import FeatureShaderCards from '../components/ui/FeatureShaderCards';
import Logo from '../components/Logo';
import CyberneticGridShader from '../components/ui/CyberneticGridShader';


const HOW_IT_WORKS = [
  {
    num: '01',
    title: 'Create a Bounty',
    desc: 'Connect your wallet. Post a task with title, requirements, and reward points. You become the owner - only you can evaluate and close it.',
  },
  {
    num: '02',
    title: 'Submit Solutions',
    desc: 'Workers submit a public URL (GitHub, deployment) with a description. Multiple workers can compete. Owners cannot self-submit.',
  },
  {
    num: '03',
    title: 'AI Evaluation',
    desc: 'GenLayer validators independently fetch the URL, read the real content, and score 0-100 via on-chain consensus. No single point of failure.',
  },
  {
    num: '04',
    title: 'Winner Selected',
    desc: 'Owner closes the bounty. AI judges pick the best submission through consensus. Reward points are stored permanently on-chain.',
  },
];

function Landing() {
  return (
    <div className="min-h-screen flex flex-col relative bg-black text-white">
      <CyberneticGridShader />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/20">
        <div className="w-full px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 text-white" />
            <div className="font-mono">
              <div className="text-base font-bold tracking-wider text-white">BOUNTY_RESOLVER</div>
              <div className="text-[10px] text-white -mt-0.5 tracking-widest">{'> GENLAYER_AI'}</div>
            </div>
          </div>
          <Link
            to="/app"
            className="font-mono px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white text-sm font-bold tracking-wider transition-all hover:shadow-[0_0_20px_rgba(255, 255, 255,0.4)]"
          >
            ENTER_ARENA
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="flex-1 flex flex-col items-start justify-center text-left max-w-6xl mx-auto px-6 py-24 w-full">
          <div className="flex items-center gap-2 mb-6 font-mono text-xs text-white tracking-widest">
            <span className="w-2 h-2 bg-white animate-pulse"></span>
            <span>// DECENTRALIZED_AI_JUDGMENT_PROTOCOL</span>
          </div>
          <h1 className="font-mono font-bold text-5xl md:text-7xl mb-8 leading-tight tracking-tight">
            <span className="text-white">BOUNTY</span>
            <span className="text-white">.</span>
            <span className="text-white">RESOLVER</span>
            <span className="text-white animate-pulse">_</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl leading-relaxed mb-4 border-l-2 border-white/40 pl-4">
            The first AI-judged bounty platform built on GenLayer. Create bounties, submit solutions,
            and let decentralized AI validators evaluate work quality and pick winners through on-chain consensus.
          </p>
          <p className="text-gray-500 text-sm max-w-2xl mb-12 font-mono">
            {'> '} No middlemen. No bias. Trustless judgment powered by multiple AI validators that fetch, read, and score submissions in real-time.
          </p>
          <Link
            to="/app"
            className="font-mono px-8 py-4 bg-white/10 hover:bg-white/20 text-white border-2 border-white text-sm font-bold tracking-widest transition-all hover:shadow-[0_0_30px_rgba(255, 255, 255,0.5)]"
          >
            [ ENTER_ARENA ]
          </Link>
        </section>

        {/* How It Works */}
        <section className="max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="mb-12">
            <div className="font-mono text-xs text-white tracking-widest mb-2">// PROTOCOL_FLOW</div>
            <h2 className="font-mono font-bold text-3xl md:text-4xl text-white tracking-tight">
              How_It_Works<span className="text-white">()</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.num}
                className="p-6 bg-[#0a0a0a] border border-white/30 transition-all hover:border-white hover:shadow-[0_0_20px_rgba(255, 255, 255,0.2)] text-left"
              >
                <div className="font-mono text-4xl font-bold text-white mb-4 tracking-tight">
                  {step.num}
                </div>
                <h3 className="font-mono text-white font-bold mb-3 text-base tracking-wide">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Bounty Resolver */}
        <section className="max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="mb-12">
            <div className="font-mono text-xs text-white tracking-widest mb-2">// CORE_FEATURES</div>
            <h2 className="font-mono font-bold text-3xl md:text-4xl text-white tracking-tight">
              Why_Bounty_Resolver<span className="text-white">()</span>
            </h2>
          </div>
          <FeatureShaderCards />
        </section>

        {/* Footer */}
        <footer className="border-t border-white/20 py-6 mt-12">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <span className="w-2 h-2 bg-white animate-pulse"></span>
              <span>{'> SYSTEM_OPERATIONAL // POWERED_BY_GENLAYER'}</span>
            </div>
            <div className="text-gray-600 tracking-widest">STUDIONET // CHAIN_ID_61999</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Landing;
