const { createClient } = require('@supabase/supabase-js');


console.log('supabse url', process.env.SUPABASE_URL);
const superBase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const superBaseConnect = () => {
  try {
    superBase;
    console.log('SuperBase Connected Successfully');
  } catch (error) {
    console.log('SuperBase error');
  }
};
module.exports = { superBaseConnect, superBase };
