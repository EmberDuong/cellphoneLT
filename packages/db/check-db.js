const postgres = require('postgres');
const client = postgres('postgresql://postgres:Duy123456@localhost:5432/cellphonelt');

client`SELECT 1 as result`
  .then(r => {
    console.log('Connection successful:', r);
    process.exit(0);
  })
  .catch(e => {
    console.error('Connection failed:', e);
    process.exit(1);
  });
