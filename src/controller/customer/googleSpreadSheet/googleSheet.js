const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const crends = require('../../../data-key.json');

const PayloadStoring = async (data) => {
  const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ];

  const jwt = new JWT({
    email: crends.client_email,
    key: crends.private_key,
    scopes: SCOPES,
  });
  const doc = new GoogleSpreadsheet(
    '1CR07x7mcGQGtm4e6hRha9ckBN-QhZM6ApMNdny41YFU',
    jwt
  );
  await doc.loadInfo();
  console.log(doc.title);
  const sheet = doc.sheetsByIndex[0];
  await sheet.addRow(data);
  const HEADERS = [
    'From',
    'To',
    'Date',
    'Passengers',
    ' mobile',
    'countryCode',
  ];
  await sheet.setHeaderRow(HEADERS);
  await doc.updateProperties({ title: 'qwiklif Enquiry' });
};

module.exports = { PayloadStoring };
