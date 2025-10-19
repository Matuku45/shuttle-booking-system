// app.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// ===== Environment =====
const PORT = process.env.PORT || 3000;       // Backend port
const HOST = process.env.HOST || '0.0.0.0';  // Listen on all interfaces
const NODE_ENV = process.env.NODE_ENV || 'development';

// ===== Routers =====
const usersRouter = require('./routes/users');
const signinRouter = require('./routes/signin');
const shuttleRoutes = require('./routes/shuttle');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');

const app = express();

// ===== CORS setup =====
const allowedOrigins = [
  'https://shuttle-booking-app-rough-wind-1710.fly.dev',
  'https://shuttle-booking-app-blue-violet-2485.fly.dev', // your deployed frontend
];


// Allow localhost in dev
if (NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173');
  allowedOrigins.push('http://127.0.0.1:5173');
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
}));

// ===== Middleware =====
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ===== Swagger setup =====
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Shuttle Booking API',
      version: '1.0.0',
      description: 'Users, Shuttles, Bookings (CRUD), Payments API',
    },
    servers: [
      {
        url: NODE_ENV === 'production'
          ? 'https://shuttle-booking-system.fly.dev'
          : `http://localhost:${PORT}`,
        description: 'Server URL',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Shuttle: {
          type: 'object',
          required: ['route', 'date', 'time', 'seats', 'price'],
          properties: {
            id: { type: 'integer' },
            route: { type: 'string' },
            date: { type: 'string', format: 'date' },
            time: { type: 'string', format: 'time' },
            duration: { type: 'number' },
            pickup: { type: 'string' },
            seats: { type: 'integer' },
            price: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Booking: {
          type: 'object',
          required: ['passenger_name', 'shuttle_id'],
          properties: {
            id: { type: 'integer' },
            passenger_name: { type: 'string' },
            shuttle_id: { type: 'integer' },
            origin: { type: 'string' },
            destination: { type: 'string' },
            departure_date: { type: 'string', format: 'date' },
            departure_time: { type: 'string', format: 'time' },
            duration: { type: 'number' },
            pickup_window: { type: 'integer' },
            seats_left: { type: 'integer' },
            price_per_seat: { type: 'number' },
            status: { type: 'string', default: 'Pending' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          required: ['passenger_name', 'shuttle_id', 'amount'],
          properties: {
            id: { type: 'integer' },
            passenger_name: { type: 'string' },
            shuttle_id: { type: 'integer' },
            booking_id: { type: 'integer' },
            amount: { type: 'number' },
            status: { type: 'string', default: 'Pending' },
            payment_date: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/', (req, res) => res.redirect('/api-docs'));

// ===== Routes =====
app.use('/users', usersRouter);
app.use('/users/login', signinRouter);
app.use('/api/shuttles', shuttleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// ===== 404 handler =====
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

// ===== Error handler =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || 'Internal Server Error' });
});

// ===== Start server =====
app.listen(PORT, HOST, () => {
  console.log(`🚀 Backend running in ${NODE_ENV} mode on http://${HOST}:${PORT}`);
});

module.exports = app;
