import React from "react";
import { Warp } from "@paper-design/shaders-react";

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

const shaderConfigs = [
  {
    proportion: 0.3, softness: 0.8, distortion: 0.15, swirl: 0.6, swirlIterations: 8,
    shape: "checks", shapeScale: 0.08,
    colors: ["hsl(270, 100%, 12%)", "hsl(275, 90%, 35%)", "hsl(265, 80%, 20%)", "hsl(280, 100%, 45%)"],
  },
  {
    proportion: 0.4, softness: 1.2, distortion: 0.2, swirl: 0.9, swirlIterations: 12,
    shape: "dots", shapeScale: 0.12,
    colors: ["hsl(260, 90%, 10%)", "hsl(270, 100%, 40%)", "hsl(275, 85%, 18%)", "hsl(268, 95%, 50%)"],
  },
  {
    proportion: 0.35, softness: 0.9, distortion: 0.18, swirl: 0.7, swirlIterations: 10,
    shape: "checks", shapeScale: 0.1,
    colors: ["hsl(265, 100%, 14%)", "hsl(272, 95%, 38%)", "hsl(258, 80%, 22%)", "hsl(278, 100%, 48%)"],
  },
  {
    proportion: 0.45, softness: 1.1, distortion: 0.22, swirl: 0.8, swirlIterations: 15,
    shape: "dots", shapeScale: 0.09,
    colors: ["hsl(275, 90%, 11%)", "hsl(268, 100%, 42%)", "hsl(280, 85%, 16%)", "hsl(262, 95%, 52%)"],
  },
  {
    proportion: 0.38, softness: 0.95, distortion: 0.16, swirl: 0.85, swirlIterations: 11,
    shape: "checks", shapeScale: 0.11,
    colors: ["hsl(258, 100%, 13%)", "hsl(270, 90%, 36%)", "hsl(272, 80%, 20%)", "hsl(265, 100%, 46%)"],
  },
  {
    proportion: 0.42, softness: 1.0, distortion: 0.19, swirl: 0.75, swirlIterations: 9,
    shape: "dots", shapeScale: 0.13,
    colors: ["hsl(280, 90%, 12%)", "hsl(266, 100%, 40%)", "hsl(270, 85%, 18%)", "hsl(274, 95%, 50%)"],
  },
];

export default function FeatureShaderCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => {
        const config = shaderConfigs[index % shaderConfigs.length];
        return (
          <div key={index} className="relative h-72 group">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <Warp
                style={{ height: "100%", width: "100%" }}
                proportion={config.proportion}
                softness={config.softness}
                distortion={config.distortion}
                swirl={config.swirl}
                swirlIterations={config.swirlIterations}
                shape={config.shape}
                shapeScale={config.shapeScale}
                scale={1}
                rotation={0}
                speed={0.5}
                colors={config.colors}
              />
            </div>
            <div className="relative z-10 p-7 rounded-2xl h-full flex flex-col bg-black/75 border border-white/10 group-hover:border-violet-500/30 transition-all">
              <h3 className="text-lg font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed flex-grow text-slate-300">{feature.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

