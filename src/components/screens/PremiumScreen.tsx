import React, { useState } from 'react';
import {
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Tv,
  ArrowDownToLine,
  Zap,
  Check
} from 'lucide-react';
import { PREMIUM_PLANS } from '../../data/mediaData';
import { UserProfile } from '../../types';

interface PremiumScreenProps {
  user: UserProfile;
  onUpgradePlan: (planName: string) => void;
}

export const PremiumScreen: React.FC<PremiumScreenProps> = ({
  user,
  onUpgradePlan,
}) => {
  const [currency, setCurrency] = useState<'USh' | 'USD'>('USh');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-1m');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleBuyNow = (plan: typeof PREMIUM_PLANS[0]) => {
    setSelectedPlanId(plan.id);
    onUpgradePlan(plan.duration);
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
    }, 3500);
  };

  return (
    <div id="premium-screen-view" className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-28 text-white px-4 pt-3 overscroll-contain">
      {/* User Avatar + Plan Status Banner at top */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 p-0.5 shadow">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-full h-full rounded-full bg-zinc-900 object-cover"
          />
        </div>
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>{user.username}</span>
            {user.plan === 'VIP Premium' && (
              <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
            )}
          </div>
          <div className="text-[11px] text-zinc-400">ID: {user.movieBoxId}</div>
        </div>
      </div>

      {/* Plan Status Banner */}
      <div
        className={`w-full p-4 rounded-2xl mb-6 border transition ${
          user.plan === 'VIP Premium'
            ? 'bg-gradient-to-r from-amber-950/80 via-yellow-900/40 to-amber-950/80 border-amber-500/40 text-amber-200 shadow-lg shadow-amber-900/20'
            : 'bg-[#29220c] border-amber-500/20 text-amber-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight">
              {user.plan === 'VIP Premium' ? 'VIP Premium Active' : 'Free Plan'}
            </h2>
            <p className="text-xs text-amber-300/80 mt-0.5">
              {user.plan === 'VIP Premium'
                ? 'All benefits unlocked until Nov 2026'
                : 'Standard 480p streaming with ads'}
            </p>
          </div>
          <Crown className="w-8 h-8 text-amber-400/80" />
        </div>
      </div>

      {/* "Get your Premium benefits" Section with 3 icon badges */}
      <div className="text-center mb-6">
        <h3 className="text-base font-black text-[#eab308] tracking-wide mb-4">
          Get your Premium benefits
        </h3>

        {/* 3 Icon Badges with "+" between them */}
        <div className="flex items-center justify-center gap-3">
          {/* Badge 1: No Ads */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1c1a12] border border-amber-500/30 flex items-center justify-center text-amber-400 relative shadow-sm">
              <div className="relative flex items-center justify-center">
                <span className="text-xs font-black tracking-tighter">AD</span>
                <span className="absolute w-5 h-0.5 bg-amber-400 rotate-45" />
              </div>
            </div>
            <span className="text-xs font-semibold text-zinc-200 mt-2">No ads</span>
          </div>

          <span className="text-amber-400/80 text-lg font-bold pb-5">+</span>

          {/* Badge 2: HD Quality */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1c1a12] border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <span className="text-xs font-black tracking-tight px-1 py-0.5 border-2 border-amber-400 rounded">
                HD
              </span>
            </div>
            <span className="text-xs font-semibold text-zinc-200 mt-2">720P quality</span>
          </div>

          <span className="text-amber-400/80 text-lg font-bold pb-5">+</span>

          {/* Badge 3: Multi-downloads */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1c1a12] border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <ArrowDownToLine className="w-6 h-6 stroke-[2.3]" />
            </div>
            <span className="text-xs font-semibold text-zinc-200 mt-2">Multi-downloads</span>
          </div>
        </div>
      </div>

      {/* Currency Switcher */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Choose Your Plan
        </span>
        <div className="flex bg-[#161824] p-0.5 rounded-lg border border-white/5">
          <button
            onClick={() => setCurrency('USh')}
            className={`px-2 py-0.5 text-[11px] rounded font-bold transition ${
              currency === 'USh' ? 'bg-[#eab308] text-black' : 'text-zinc-400'
            }`}
          >
            USh
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2 py-0.5 text-[11px] rounded font-bold transition ${
              currency === 'USD' ? 'bg-[#eab308] text-black' : 'text-zinc-400'
            }`}
          >
            USD
          </button>
        </div>
      </div>

      {/* Stacked Pricing Cards */}
      <div className="space-y-3">
        {PREMIUM_PLANS.map((plan) => {
          const displayPrice = currency === 'USh' ? plan.price : plan.usdPrice;
          const displayBreakdown =
            currency === 'USh'
              ? plan.monthlyBreakdown
              : `${(parseFloat(plan.usdPrice.replace('$', '')) / (plan.duration.includes('3') ? 3 : plan.duration.includes('12') ? 12 : 1)).toFixed(2)}/mo`;

          return (
            <div
              key={plan.id}
              className="flex items-stretch rounded-2xl bg-[#1d1f2b] border border-white/5 overflow-hidden hover:border-amber-400/40 transition shadow-md"
            >
              {/* Left Info Column */}
              <div className="flex-1 p-3.5 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium">
                    {plan.duration}
                  </span>
                  {plan.savings && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <div className="text-lg font-black text-white mt-0.5">
                  {displayPrice}
                </div>

                <div className="text-[11px] text-zinc-400">
                  {displayBreakdown}
                </div>
              </div>

              {/* Right "Buy Now" Button Column (Gold / Yellow Accent as shown in screenshot) */}
              <button
                onClick={() => handleBuyNow(plan)}
                className="w-28 bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-black font-black text-sm flex items-center justify-center transition"
              >
                Buy Now
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Toast */}
      {checkoutSuccess && (
        <div className="fixed bottom-20 inset-x-4 max-w-sm mx-auto bg-[#00df82] text-black p-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-6 h-6 fill-black text-[#00df82] shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Payment Coming Soon!</p>
            <p className="text-[11px] opacity-90">You are already a VIP user. Enjoy all premium benefits!</p>
          </div>
        </div>
      )}

      {/* Footer Guarantee */}
      <div className="mt-6 text-center text-[11px] text-zinc-500 space-y-1">
        <p>Cancel anytime in Google Play or App Store subscriptions.</p>
        <p>Supports Airtel Money, MTN MoMo, Card & Google Pay.</p>
      </div>
    </div>
  );
};
