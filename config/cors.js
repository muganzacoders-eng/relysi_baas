const corsOptions = {
  origin: [
    'https://relysi-ui.vercel.app',
    'http://localhost:3000',
    'https://your-production-domain.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};


module.exports = corsOptions;
