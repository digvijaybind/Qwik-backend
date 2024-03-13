const cron=require('node-cron');
const qs = require('qs');
const axios = require("axios");
const data = {
  client_id: 'vppVZGQGOnwkvZBSjgysgUzUUIdSAF6u',
  client_secret: 'uA0UEOCy3vIIkWZD',
  grant_type:'client_credentials'
};
let access_token='XEqUw35IBjjwQ04Q8FeZpXjlZ6GA'
const urlEncodedData = qs.stringify(data);
const apiUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';


async function getProcessedApiData() {
  try {
    const response =
    await axios.post(apiUrl, urlEncodedData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    access_token = response.data.access_token;
    console.log('access_token',response.data)
    console.log("this access_token",access_token);

  } catch (error) {
    console.error('Error fetching or processing API data:', error);
   access_token=null
  }
}

cron.schedule('*/30 * * * *', async () => {
  const rawApiData = await getProcessedApiData();

});



module.exports = {access_token};