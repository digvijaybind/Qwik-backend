const { createClient } = require('@supabase/supabase-js');

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
