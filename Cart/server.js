const redis = require('redis');
const axios = require('axios');
const bodyParser = require('body-parser');
const express = require('express');
const pino = require('pino');
const pinoHttp = require('pino-http');

// Prometheus
const promClient = require('prom-client');
const register = new promClient.Registry();
const counter = new promClient.Counter({
    name: 'items_added',
    help: 'running count of items added to cart',
    registers: [register]
});

let redisConnected = false;

const redisHost = process.env.REDIS_HOST || 'redis';
const catalogueHost = process.env.CATALOGUE_HOST || 'catalogue';
const cataloguePort = process.env.CATALOGUE_PORT || '8080';

const logger = pino({ level: 'info' });

const app = express();
app.use(pinoHttp({ logger }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Redis Client (v4 FIX)
const redisClient = redis.createClient({
    url: `redis://${redisHost}:6379`
});

redisClient.on('error', (err) => {
    logger.error('Redis ERROR', err);
});

(async () => {
    try {
        await redisClient.connect();
        redisConnected = true;
        logger.info('Redis Connected');
    } catch (err) {
        logger.error('Redis Connection Failed', err);
    }
})();

// Health
app.get('/health', (req, res) => {
    res.json({
        app: 'OK',
        redis: redisConnected
    });
});

// Metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// GET cart
app.get('/cart/:id', async (req, res) => {
    try {
        const data = await redisClient.get(req.params.id);
        if (!data) return res.status(404).send('cart not found');
        res.json(JSON.parse(data));
    } catch (err) {
        req.log.error(err);
        res.status(500).send(err);
    }
});

// DELETE cart
app.delete('/cart/:id', async (req, res) => {
    try {
        const result = await redisClient.del(req.params.id);
        if (result === 1) return res.send('OK');
        res.status(404).send('cart not found');
    } catch (err) {
        req.log.error(err);
        res.status(500).send(err);
    }
});

// ADD item
app.get('/add/:id/:sku/:qty', async (req, res) => {
    try {
        const qty = parseInt(req.params.qty);
        if (isNaN(qty) || qty < 1) {
            return res.status(400).send('Invalid quantity');
        }

        const product = await getProduct(req.params.sku);
        if (!product) return res.status(404).send('product not found');

        let cartData = await redisClient.get(req.params.id);
        let cart = cartData ? JSON.parse(cartData) : { total: 0, tax: 0, items: [] };

        const item = {
            qty,
            sku: req.params.sku,
            name: product.name,
            price: product.price,
            subtotal: qty * product.price
        };

        cart.items = mergeList(cart.items, item, qty);
        cart.total = calcTotal(cart.items);
        cart.tax = calcTax(cart.total);

        await saveCart(req.params.id, cart);
        counter.inc(qty);

        res.json(cart);
    } catch (err) {
        req.log.error(err);
        res.status(500).send(err);
    }
});

// ---------------- FUNCTIONS ----------------

function mergeList(list, product, qty) {
    const existing = list.find(i => i.sku === product.sku);
    if (existing) {
        existing.qty += qty;
        existing.subtotal = existing.qty * existing.price;
    } else {
        list.push(product);
    }
    return list;
}

function calcTotal(list) {
    return list.reduce((sum, item) => sum + item.subtotal, 0);
}

function calcTax(total) {
    return total - (total / 1.2);
}

// AXIOS FIX (replaces request)
async function getProduct(sku) {
    try {
        const res = await axios.get(`http://${catalogueHost}:${cataloguePort}/product/${sku}`);
        return res.data;
    } catch (err) {
        return null;
    }
}

async function saveCart(id, cart) {
    await redisClient.setEx(id, 3600, JSON.stringify(cart));
}

// START SERVER
const port = process.env.CART_SERVER_PORT || 8080;
app.listen(port, () => {
    logger.info(`Cart service started on port ${port}`);
});