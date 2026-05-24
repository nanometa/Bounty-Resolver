import React from "react";

const features = [
  {
    title: "Trustless AI Judgment",
    description: "Multiple independent AI validators evaluate each submission. Consensus ensures no single point of bias. Results stored immutably on-chain.",
  },
  {
    title: "Real Web Access",
    description: "Validators fetch and read submitted URLs directly. They evaluate real content -- GitHub repos, deployed apps, articles. No oracles needed.",
  },
  {
    title: "On-Chain Transparency",
    description: "Every bounty, submission, score, and winner selection is recorded permanently on GenLayer. Fully auditable, zero disputes possible.",
  },
  {
    title: "No Oracles Required",
    description: "GenLayer contracts access the web directly from the blockchain. No Chainlink, no third-party feeds. The contract fetches data itself.",
  },
  {
    title: "Leaderboard Rankings",
    description: "Winners accumulate points across bounties. Build verifiable on-chain reputation. Track top contributors and prove your skills.",
  },
  {
    title: "Open to Everyone",
    description: "Anyone can create bounties or submit solutions. Connect MetaMask and start participating. No KYC, no gatekeepers, no middlemen.",
  },
];

export default function FeatureShaderCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((feature, index) => (
        <div
          key={index}
          className="p-6 bg-[#0a0a0a] border border-white/30 transition-all hover:border-white hover:shadow-[0_0_20px_rgba(255, 255, 255,0.2)] text-left group"
        >
          <div className="font-mono text-xs text-white mb-3 tracking-widest">
            // FEATURE_{String(index + 1).padStart(2, '0')}
          </div>
          <h3 className="font-mono text-base text-white font-bold mb-3 tracking-wide group-hover:text-white transition-colors">
            {feature.title}
          </h3>
          <p className="text-sm leading-relaxed text-gray-400">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
