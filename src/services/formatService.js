const API_BASE_URL = process.env.API_BASE_URL || '';

const toUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  created_at: user.createdAt
});

const toScanResponse = (scan) => ({
  id: scan.id,
  user_id: scan.userId,
  fruit_type: scan.fruitType,
  condition: scan.condition,
  freshness_score: scan.freshnessScore,
  image_url: scan.imageUrl,
  scanned_at: scan.scannedAt
});

const toInventoryResponse = (item) => ({
  id: item.id,
  user_id: item.userId,
  scan_id: item.scanId,
  fruit_type: item.fruitType,
  condition: item.condition,
  added_at: item.addedAt,
  reminder_at: item.reminderAt,
  image_url: item.scan?.imageUrl || null
});

module.exports = {
  toUserResponse,
  toScanResponse,
  toInventoryResponse
};
