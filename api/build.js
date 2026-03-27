import fs from 'fs';
fs.writeFile('built-time.js', `export default '${new Date()}'`, (err) => {
  if (err) throw err;
  console.log('Build time file created successfully!');
});