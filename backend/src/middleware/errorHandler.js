export function errorHandler(err, _req, res, _next) {
  console.error('[backend:error]', err);
  const status = err.status || 500;
  const message = err.publicMessage || err.message || 'Internal server error';
  res.status(status).json({ error: message });
}
