import prisma from "../config/db.js";

export const getSettings = async (req, res) => {
  try {
    const profile = await prisma.financeProfile.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSalary = async (req, res) => {
  try {
    const { salary } = req.body;

    if (salary === undefined || Number(salary) < 0) {
      return res.status(400).json({ error: "Valid salary is required" });
    }

    const profile = await prisma.financeProfile.upsert({
      where: {
        userId: req.user.id,
      },
      update: {
        salary: Number(salary),
      },
      create: {
        userId: req.user.id,
        salary: Number(salary),
      },
    });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const resetFinanceData = async (req, res) => {
  try {
    await prisma.expense.deleteMany({
      where: { userId: req.user.id },
    });

    await prisma.budgetLimit.deleteMany({
      where: { userId: req.user.id },
    });

    await prisma.warningLog.deleteMany({
  where: { userId: req.user.id },
});

    await prisma.savingPlan.deleteMany({
      where: { userId: req.user.id },
    });

    const profile = await prisma.financeProfile.update({
      where: { userId: req.user.id },
      data: {
        salary: 0,
        ignoredWarnings: 0,
        streak: 0,
        lastCheckedDate: null,
      },
    });
    

    res.json({
      message: "CashGuard data reset successfully",
      profile,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
