const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({
  static: './build'
});

// CORS ayarları
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

server.use(middlewares);
server.use('/api', router);

const port = process.env.PORT || 3002;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});