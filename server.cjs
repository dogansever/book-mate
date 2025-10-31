const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({
  static: './build'
});

// CORS middleware - Render.com için (geliştirme aşaması)
server.use((req, res, next) => {
  // Development için tüm origin'lere izin ver
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

server.use(middlewares);
server.use('/api', router);

const port = process.env.PORT || 3002;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});