const fs = require('fs');
const content = fs.readFileSync('auth_pass_fail.txt', 'utf16le'); // Try utf16le first
console.log(content);
fs.writeFileSync('auth_log.txt', content, 'utf8');
