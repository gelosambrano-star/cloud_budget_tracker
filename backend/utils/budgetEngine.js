function analyzeBudget(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(tx => {
    if (tx.amount > 0) {
      totalIncome += tx.amount;
    } else {
      // Math.abs turns your negative expenses into positive totals for calculation
      totalExpenses += Math.abs(tx.amount);
    }
  });

  // Calculate your exact remaining balance
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  let alertStatus = '';
  let alertMessage = '';

  if (netSavings < 0) {
    alertStatus = 'CRITICAL_DEFICIT';
    alertMessage = '⚠️ BUDGET DEFICIT ALERT! You are actively spending money you do not have.';
  } else if (savingsRate < 10) {
    alertStatus = 'OVERSPENDING_RISK';
    alertMessage = '💡 Overspending Risk. Your remaining savings runway is under 10% of total income.';
  } else {
    alertStatus = 'HEALTHY_SAVER';
    alertMessage = '✨ Healthy Saver! You are maintaining a great cash-flow trajectory.';
  }

  // CRITICAL CHECK: Make sure 'netSavings' is explicitly returned right here
  return { 
    totalIncome, 
    totalExpenses, 
    netSavings, 
    savingsRate: savingsRate.toFixed(1) + '%', 
    alertStatus, 
    alertMessage 
  };
}

module.exports = { analyzeBudget };
