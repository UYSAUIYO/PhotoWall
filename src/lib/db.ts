import mysql from 'mysql2/promise';

let _pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!_pool) {
    _pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'photowall',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return _pool;
}

const pool = new Proxy({} as mysql.Pool, {
  get(_, prop: string) {
    const real = getPool();
    const value = (real as any)[prop];
    if (typeof value === 'function') {
      return value.bind(real);
    }
    return value;
  },
});

export default pool;
