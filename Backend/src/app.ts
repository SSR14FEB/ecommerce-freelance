import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';   

const app = express();

app.use(cors({
    origin: '*', // Adjust the origin as needed
    credentials: true} // Allow credentials to be sent with requests
));
app.use(cookieParser());
app.use(express.json({limit:'16kb'})); // Set a limit for JSON payloads
app.use(express.urlencoded({extended: true, limit:'16kb'})); // Set a limit for URL-encoded payloads    
app.use(express.static('public'));

export default app;