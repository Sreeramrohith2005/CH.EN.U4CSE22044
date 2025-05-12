const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDU3ODIxLCJpYXQiOjE3NDcwNTc1MjEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImQwZjU0NThmLWY2ZjItNGEyNy04YTc1LTVlN2Y4NjNlZThkNSIsInN1YiI6InNyZWVyYW1yb2hpdGhhbXJpdGFAZ21haWwuY29tIn0sImVtYWlsIjoic3JlZXJhbXJvaGl0aGFtcml0YUBnbWFpbC5jb20iLCJuYW1lIjoicC4gc3JlZXJhbSByb2hpdGgiLCJyb2xsTm8iOiJjaC5lbi51NGNzZTIyMDQ0IiwiYWNjZXNzQ29kZSI6IlN3dXVLRSIsImNsaWVudElEIjoiZDBmNTQ1OGYtZjZmMi00YTI3LThhNzUtNWU3Zjg2M2VlOGQ1IiwiY2xpZW50U2VjcmV0IjoiUWRGbnBTWEJlYXV2a3VOayJ9.60AXTamcdmjJ5SSK7JfwwoUMzc06TX3E6boQRzX0KVA';

const windowSize = 10;
let windowNumbers = [];

const fetchNumbers = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`
      }
    });
    console.log(`Fetched numbers from ${url}:`, response.data.numbers);  // Print fetched numbers
    return response.data.numbers || [];
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error.message);
    return [];
  }
};

app.get('/numbers/:numberid', async (req, res) => {
  const numberId = req.params.numberid;
  const urlMap = {
    'p': 'http://20.244.56.144/evaluation-service/primes',
    'f': 'http://20.244.56.144/evaluation-service/fibo',
    'e': 'http://20.244.56.144/evaluation-service/even',
    'r': 'http://20.244.56.144/evaluation-service/rand'
  };

  const url = urlMap[numberId];

  if (!url) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const newNumbers = await fetchNumbers(url);
  if (newNumbers.length === 0) {
    return res.status(500).json({ error: 'No numbers returned from the server' });
  }

  // Merge new numbers and remove duplicates
  const uniqueNumbers = [...new Set([...windowNumbers, ...newNumbers])];

  // Keep the latest numbers up to the window size
  if (uniqueNumbers.length > windowSize) {
    uniqueNumbers.splice(0, uniqueNumbers.length - windowSize);
  }

  windowNumbers = uniqueNumbers;

  const avg = windowNumbers.reduce((acc, num) => acc + num, 0) / windowNumbers.length;

  console.log('Current window numbers:', windowNumbers);  // Print current window numbers
  console.log('Average of window numbers:', avg.toFixed(2));  // Print average of numbers

  res.json({
    windowPrevState: windowNumbers.slice(0, windowNumbers.length - newNumbers.length),
    windowCurrState: windowNumbers,
    numbers: newNumbers,
    avg: avg.toFixed(2)
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
