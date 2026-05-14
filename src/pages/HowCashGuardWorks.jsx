import PageHeader from "../components/common/PageHeader";
import SurfaceCard from "../components/common/SurfaceCard";

const blocks = [
  {
    title: "1) Remaining Money",
    formula: "Remaining = Salary - Total Spent",
    explain:
      "This tells you how much money is left for the current month after all logged expenses.",
  },
  {
    title: "2) Safe Daily Budget (Before Plans)",
    formula: "Normal Daily Budget = Remaining / Remaining Days",
    explain:
      "CashGuard spreads your remaining money over the days left in the month, so you get a safe amount for one day.",
  },
  {
    title: "3) Plans Pressure (Future Goals)",
    formula:
      "Plan Pressure = Sum of required daily saving for all active plans",
    explain:
      "Each active plan (like Dubai Trip, Emergency Fund, or Education Fee) reserves a daily amount so your future goals stay on track.",
  },
  {
    title: "4) Real Safe Daily Spend",
    formula: "Real Daily Budget = Normal Daily Budget - Plan Pressure",
    explain:
      "This is the real amount you can safely spend today after protecting your plans.",
  },
  {
    title: "5) Month-End Projection",
    formula: "Projected Spend = (Spent So Far / Days Passed) x Total Days",
    explain:
      "This estimates where your spending will end if you continue at the same pace.",
  },
  {
    title: "6) Spending Percentage",
    formula: "Spent % = (Total Spent / Salary) x 100",
    explain:
      "This shows how much of your salary has already been used as a percentage.",
  },
  {
    title: "7) When Warnings Appear",
    formula:
      "Warning if you cross real daily budget, category limit, dangerous projection, or harm active plans",
    explain:
      "Warnings stop risky spending before damage happens. If one expense harms your active plans and daily safety together, CashGuard shows all risks in one confirmation modal.",
  },
  {
    title: "8) Plan Track Calculations",
    formula:
      "Required Daily = Remaining Plan Amount / Days Left, Required Monthly = Remaining Plan Amount / Months Left",
    explain:
      "For each plan, CashGuard calculates the exact saving pace needed to hit the deadline.",
  },
];

export default function HowCashGuardWorks() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="How CashGuard Works"
        subtitle="Simple explanation of every key number you see in the app."
      />

      <section className="mt-6 grid gap-4 sm:gap-5">
        {blocks.map((block) => (
          <SurfaceCard key={block.title}>
            <h2 className="text-lg font-extrabold text-slate-900">{block.title}</h2>
            <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800">
              {block.formula}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{block.explain}</p>
          </SurfaceCard>
        ))}
      </section>
    </div>
  );
}
