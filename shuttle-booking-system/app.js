const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const usersRouter = require('./routes/users');
const signinRouter = require('./routes/signin');
const shuttleRoutes = require('./routes/shuttle');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');

const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', methods: ['GET','POST','PUT','DELETE','PATCH'], credentials: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Shuttle Booking API',
      version: '1.0.0',
      description: 'Users, Shuttles, Bookings (CRUD), Payments (Create/Update) API'
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local server' }],
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
            created_at: { type: 'string', format: 'date-time' }
          }
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
            updated_at: { type: 'string', format: 'date-time' }
          }
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
            created_at: { type: 'string', format: 'date-time' }
          }
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
            created_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/', (req, res) => res.redirect('/api-docs'));

// Routes
app.use('/users', usersRouter);
app.use('/users/login', signinRouter);
app.use('/api/shuttles', shuttleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: "Not Found" }));

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message });
});

module.exports = app;
