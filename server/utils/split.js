export const calculateEqualSplit = (amount, participants, paidBy) => {
  const others = participants.filter(
    (userId) => userId.toString() !== paidBy.toString()
  );

  if (others.length === 0) {
    return [{ user: paidBy, amount: 0 }];
  }

  const share = amount / others.length;

  return participants.map((userId) => ({
    user: userId,
    amount: userId.toString() === paidBy.toString() ? 0 : share,
  }));
};