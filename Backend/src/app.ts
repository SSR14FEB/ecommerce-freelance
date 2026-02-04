import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';   
const app = express();

app.use(cors({
    origin: '*', // Adjust the origin as needed
    credentials: true     // Allow credentials to be sent with requests
}));
app.use(cookieParser());
app.use(express.json({limit:'16kb'})); // Set a limit for JSON payloads
app.use(express.urlencoded({extended: true, limit:'16kb'})); // Set a limit for URL-encoded payloads    
app.use(express.static('public'));
import auth from "./routes/auth-routes"
import user from "./routes/user-routes"
import product from "./routes/product-routes"
import cart from "./routes/cart-routes"
import orders from './routes/order-routes';
import payments from './routes/payment-routes';

// Auth
app.use("/api/user-authentication",auth)

// User
app.use("/api/user",user)

// Product
app.use("/api/product",product)

// Cart
app.use("/api/cart",cart)

// Order-product
app.use("/api/order-product",orders)

// Payment-order
app.use("/api/payment-order",payments)
export default app;