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
    title: "2) Safe Daily Budget",
    formula: "Daily Budget = Remaining / Remaining Days",
    explain:
      "CashGuard spreads your remaining money over the days left in the month, so you get a safe amount for one day.",
  },
  {
    title: "3) Month-End Projection",
    formula: "Projected Spend = (Spent So Far / Days Passed) x Total Days",
    explain:
      "This estimates where your spending will end if you continue at the same pace.",
  },
  {
    title: "4) Spending Percentage",
    formula: "Spent % = (Total Spent / Salary) x 100",
    explain:
      "This shows how much of your salary has already been used as a percentage.",
  },
  {
    title: "5) When Warnings Appear",
    formula: "Warning if you cross daily budget, category limit, or dangerous projection",
    explain:
      "Warnings are there to stop risky spending before your month gets out of control. If more than one risk is hit, CashGuard shows all of them together.",
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
