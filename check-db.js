const postgres = require('postgres');
const sql = postgres('postgresql://postgres:password@localhost:5432/cellphonelt');
sql`SELECT 1 as result`
  .then(r => {
    console.log('Connection successful:', r);
    process.exit(0);
  })
  .catch(e => {
    console.error('Connection failed:', e.message);
    process.exit(1);
  });
