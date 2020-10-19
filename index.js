/**
 * A sample Express server with static resources.
 */
"use strict"

if(process.env.NODE_ENV != 'production')
{
    require('dotenv').config();
}
const port = 1337;
const path = require("path");

const routeIndex = require("./route/router.js"); 
const middeware = require("./middleware/index.js");

const express = require("express");
const app = express();
const bcrypt = require('bcrypt')
const passport = require('passport');
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require('method-override')


const router = require('./route/router.js');

app.set("view engine", "ejs");

app.use(middeware.logIncomingToConsole);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: false}))
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'))



app.listen(port, logStartUpDetailsToConsole);
app.use("/", routeIndex);
/**
 * Log app details to console when starting up.
 * @returns {void}
 */
function logStartUpDetailsToConsole() {
    let routes = [];

    // Find what routes are suppported
    app._router.stack.forEach((middeware) => {
        if (middeware.route){
            routes.push(middeware.route);
        }else if (middeware.name === "router") {
            middeware.handle.stack.forEach((handler) => {
                let route;

                route = handler.route;
                route && routes.push(route);
            });
        }
    });
    console.info(`Server is listening on port ${port}.`);
    console.info(`Available routes are:`);
    console.table(routes);
}