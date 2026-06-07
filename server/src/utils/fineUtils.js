const dayInMs = 24 * 60 * 60 * 1000;

export const calculateFine = (dueAt, compareDate = new Date()) => {
  const due = new Date(dueAt);
  const comparison = new Date(compareDate);
  const daysLate = Math.max(0, Math.ceil((comparison - due) / dayInMs));
  const finePerDay = Number(process.env.FINE_PER_DAY || 0.5);

  return Number((daysLate * finePerDay).toFixed(2));
};

export const addLoanDays = (fromDate = new Date()) => {
  const loanDays = Number(process.env.LOAN_DAYS || 14);
  const dueAt = new Date(fromDate);
  dueAt.setDate(dueAt.getDate() + loanDays);
  return dueAt;
};
