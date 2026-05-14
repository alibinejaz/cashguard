export function getBehaviorMessage(count) {
  if (count === 0) {
    return {
      tone: "safe",
      message: "You are making disciplined financial decisions.",
    };
  }

  if (count <= 2) {
    return {
      tone: "warning",
      message: `You ignored ${count} warning${count > 1 ? "s" : ""}. Be careful.`,
    };
  }

  if (count <= 5) {
    return {
      tone: "danger",
      message: `You ignored ${count} warnings. Your spending is getting out of control.`,
    };
  }

  return {
    tone: "danger",
    message: `You ignored ${count} warnings. You have lost control of your budget.`,
  };
}