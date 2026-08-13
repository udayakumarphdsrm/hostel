const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function reset() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('admin123', salt);

  console.log('Fresh Hash for admin123:', hash);

  const fallbackFile = path.join(__dirname, '../config/fallback_data.json');
  let data = { users: [], reports: [] };

  if (fs.existsSync(fallbackFile)) {
    data = JSON.parse(fs.readFileSync(fallbackFile, 'utf8'));
  }

  // Update or insert warden user
  const wardenIdx = data.users.findIndex(u => u.username === 'warden');
  if (wardenIdx >= 0) {
    data.users[wardenIdx].password_hash = hash;
  } else {
    data.users.push({
      id: 1,
      username: 'warden',
      password_hash: hash,
      role: 'warden',
      full_name: 'Chief Hostel Warden',
      created_at: new Date().toISOString()
    });
  }

  fs.writeFileSync(fallbackFile, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully updated fallback_data.json with valid bcrypt hash!');

  // Verify match immediately
  const isMatch = await bcrypt.compare('admin123', hash);
  console.log('Verification test (admin123 vs hash):', isMatch);
}

reset();
