import React, { useState } from "react";
import {
  XCircle,
  CheckCircle,
  PawPrint,
  HeartOff,
  EyeOff,
  TimerOff,
  HeartHandshake,
  ShieldCheck,
  Search,
  Clock,
  HandHelping,
  Sparkles,
  Home,
} from "lucide-react";

const DONT_ITEMS = [
  {
    title: "Impulse Adoption",
    description:
      "Adopting pets without understanding their needs often leads to neglect or abandonment.",
    icon: HeartOff,
    gradient:
      "radial-gradient(circle at 30% 30%, #2d1a1f 0%, #1a0f13 50%, #0a0506 100%)",
  },
  {
    title: "Ignoring Health Checks",
    description:
      "Skipping vaccinations, deworming, or vet visits puts animals at serious risk.",
    icon: ShieldCheck,
    gradient:
      "radial-gradient(circle at 70% 40%, #2a1820 0%, #180e14 50%, #0d0509 100%)",
  },
  {
    title: "Poor Living Conditions",
    description:
      "Inadequate space, hygiene, or enrichment harms both physical and mental health.",
    icon: Home,
    gradient:
      "radial-gradient(circle at 50% 60%, #281a22 0%, #160c11 50%, #0b0508 100%)",
  },
  {
    title: "Lack of Commitment",
    description:
      "Pets require long-term time, care, and emotional responsibility.",
    icon: TimerOff,
    gradient:
      "radial-gradient(circle at 40% 50%, #2b1a1d 0%, #190e12 50%, #0c0608 100%)",
  },
  {
    title: "Unverified Rehoming",
    description:
      "Handing over animals without proper screening can place them in unsafe homes.",
    icon: EyeOff,
    gradient:
      "radial-gradient(circle at 60% 35%, #291921 0%, #170d13 50%, #0b0609 100%)",
  },
  {
    title: "Delaying Medical Care",
    description:
      "Postponing treatment or emotional support can worsen trauma and recovery.",
    icon: HandHelping,
    gradient:
      "radial-gradient(circle at 45% 45%, #2c1b1e 0%, #1a0f11 50%, #0d0607 100%)",
  },
];

const DO_ITEMS = [
  {
    title: "Responsible Adoption",
    description:
      "Match pets with families that suit their temperament, energy, and needs.",
    icon: HeartHandshake,
    gradient:
      "radial-gradient(circle at 35% 40%, #1a2530 0%, #0f1820 50%, #070c12 100%)",
  },
  {
    title: "Prioritize Health & Safety",
    description:
      "Ensure vaccinations, sterilization, and regular vet care are completed.",
    icon: ShieldCheck,
    gradient:
      "radial-gradient(circle at 65% 50%, #1c2a32 0%, #101a22 50%, #080d14 100%)",
  },
  {
    title: "Create Safe Environments",
    description:
      "Provide clean, enriched spaces that support comfort and emotional well-being.",
    icon: PawPrint,
    gradient:
      "radial-gradient(circle at 50% 55%, #1e2834 0%, #111c26 50%, #090e15 100%)",
  },
  {
    title: "Educate Adopters",
    description:
      "Clear guidance helps new pet parents prepare and avoid common mistakes.",
    icon: Sparkles,
    gradient:
      "radial-gradient(circle at 40% 45%, #1d2631 0%, #101a23 50%, #080d13 100%)",
  },
  {
    title: "Increase Visibility",
    description:
      "Better exposure helps animals find homes faster and reduces shelter stress.",
    icon: Search,
    gradient:
      "radial-gradient(circle at 55% 38%, #1b2733 0%, #0f1921 50%, #070c14 100%)",
  },
  {
    title: "Offer Ongoing Support",
    description:
      "Post-adoption help ensures long-term success for both pets and adopters.",
    icon: Clock,
    gradient:
      "radial-gradient(circle at 48% 52%, #1f2936 0%, #121b24 50%, #090e16 100%)",
  },
];

const DoDont = () => {
  const [isDo, setIsDo] = useState(true);
  const items = isDo ? DO_ITEMS : DONT_ITEMS;

  return (
    <section
      className="relative"
      style={{
        minHeight: "100vh",
        padding: "clamp(100px,14vh,160px) 24px",
        background:
          "radial-gradient(circle at 50% 40%, #0f1f33 0%, #081423 40%, #03070c 75%, #000 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        <h2 className="text-[clamp(2.8rem,5vw,4.5rem)] font-semibold tracking-tight text-white">
          When people{" "}
          <span
            className={`transition-colors ${
              isDo ? "text-blue-400" : "text-red-400"
            }`}
          >
            {isDo ? "do's" : "don'ts"}
          </span>{" "}
          care for animals.
        </h2>

        <div
          onClick={() => setIsDo(!isDo)}
          className={`w-20 h-10 flex items-center rounded-full cursor-pointer transition-colors duration-300 ${
            isDo ? "bg-blue-500" : "bg-gray-600"
          }`}
        >
          <div
            className={`w-8 h-8 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
              isDo ? "translate-x-10" : "translate-x-1"
            }`}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
              style={{
                background: item.gradient,
                boxShadow:
                  "0 4px 24px rgba(0, 0, 0, 0.4), 0 2px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="absolute inset-0 border border-white/8 rounded-2xl group-hover:border-white/16 transition-colors duration-300" />

              <div className="relative p-8">
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-xl mb-7 transition-colors duration-300 ${
                    isDo
                      ? "bg-blue-500/12 text-blue-400 group-hover:bg-blue-500/18"
                      : "bg-red-500/12 text-red-400 group-hover:bg-red-500/18"
                  }`}
                  style={{
                    boxShadow: isDo
                      ? "0 2px 16px rgba(59, 130, 246, 0.15)"
                      : "0 2px 16px rgba(239, 68, 68, 0.15)",
                  }}
                >
                  <Icon size={28} strokeWidth={2} />
                </div>

                <h3 className="text-xl font-semibold text-white mb-4 tracking-tight">
                  {item.title}
                </h3>

                <p className="text-white/65 leading-relaxed text-[15px]">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DoDont;
