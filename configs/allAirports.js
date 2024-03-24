const getAllAirports = async (req) => {
  let allAirports = [];
  console.log(req.query.q);
  let nextPage = `https://dir.aviapages.com/api/airports/?search=${req.query.q}`;

  while (nextPage) {
    try {
      const response = await axios.get(nextPage, {
        headers: {
          accept: 'application/json',
          Authorization: process.env.AVID_API_TOKEN,
        },
      });

      if (response.status === 200) {
        const pageData = response.data.results;
        console.log('resultairports', pageData);
        allAirports = allAirports.concat(pageData);
        nextPage = response.data.next;
      } else {
        console.error('Failed to fetch aircraft data');
        break;
      }
    } catch (error) {
      console.error('Error fetching aircraft data');
      break;
    }
  }

  return allAirports;
};

module.exports = { getAllAirports };
