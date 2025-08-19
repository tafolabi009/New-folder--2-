/* eslint-disable no-console */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { getDb, initDbIfNeeded } = require('./src/db');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./src/openapi');

const PORT = process.env.PORT || 3000;

const app = express();
// behind proxies (Render/Heroku)
app.set('trust proxy', 1);

// Security & performance middleware
app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

// Simple rate limiter (customize for production)
const limiter = rateLimit({
	windowMs: 60 * 1000,
	max: 120
});
app.use(limiter);

// Healthcheck
app.get('/health', (req, res) => {
	res.json({ status: 'ok', uptime: process.uptime() });
});

// API docs
app.get('/openapi.json', (req, res) => {
	res.json(openapi);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// API routes
const resultsRouter = require('./src/routes/results');
app.use('/api/results', resultsRouter);

// Serve static test page
app.use('/', express.static(path.join(__dirname, 'public')));

// Fallback 404 for API
app.use('/api', (req, res) => {
	res.status(404).json({ error: 'Not found' });
});

// JSON parse errors and other errors
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	if (err && err.type === 'entity.parse.failed') {
		return res.status(400).json({ error: 'Invalid JSON body' });
	}
	return res.status(500).json({ error: 'Internal Server Error' });
});

initDbIfNeeded()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server listening on http://localhost:${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Fatal startup error:', err);
		process.exit(1);
	});


