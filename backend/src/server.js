const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Hotel Booking API listening on http://localhost:${PORT}/api`);
});
