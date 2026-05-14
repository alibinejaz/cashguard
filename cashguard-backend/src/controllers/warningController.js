import prisma from "../config/db.js";

export const getWarnings = async (req, res) => {
  try {
    const warnings = await prisma.warningLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(warnings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};