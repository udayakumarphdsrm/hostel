const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function addDean() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('admin123', salt);

  const fallbackFile = path.join(__dirname, '../config/fallback_data.json');
  let data = { users: [], reports: [] };

  if (fs.existsSync(fallbackFile)) {
    data = JSON.parse(fs.readFileSync(fallbackFile, 'utf8'));
  }

  const deanIdx = data.users.findIndex(u => u.username === 'deanadmin');
  if (deanIdx >= 0) {
    data.users[deanIdx].password_hash = hash;
  } else {
    data.users.push({
      id: 2,
      username: 'deanadmin',
      password_hash: hash,
      role: 'dean',
      full_name: 'Dean (Student Affairs)',
      created_at: new Date().toISOString()
    });
  }

  fs.writeFileSync(fallbackFile, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully added/updated deanadmin user in fallback_data.json!');
}

addDean();
