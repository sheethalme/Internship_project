const db = require('../config/db');

const awardPoints = async (studentId, orderId, amount) => {
  const earned = Math.floor(amount / 10);
  if (earned <= 0) return 0;
  await db.query('UPDATE students SET loyalty_points = loyalty_points + ? WHERE student_id = ?', [earned, studentId]);
  await db.query('INSERT INTO loyalty_log (student_id, order_id, points_earned) VALUES (?, ?, ?)', [studentId, orderId, earned]);
  return earned;
};

const redeemPoints = async (studentId, orderId, pointsToRedeem) => {
  const discount = Math.floor(pointsToRedeem / 100) * 10;
  await db.query('UPDATE students SET loyalty_points = loyalty_points - ? WHERE student_id = ?', [pointsToRedeem, studentId]);
  await db.query('INSERT INTO loyalty_log (student_id, order_id, points_redeemed) VALUES (?, ?, ?)', [studentId, orderId, pointsToRedeem]);
  return discount;
};

module.exports = { awardPoints, redeemPoints };
