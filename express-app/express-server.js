'use strict';

const express = require("express");
const passport = require("passport");
const APIStrategy = require("ibmcloud-appid").APIStrategy;

const app = (module.exports = express());

if (process.env.NODE_ENV !== "dev" && process.env.NODE_ENV !== "test") {
    app.use(passport.initialize());
    passport.use(new APIStrategy({
        oauthServerUrl: "https://eu-de.appid.cloud.ibm.com/oauth/v4/a8bf17bc-10f5-476b-a4c8-b9eb1e5d6072"
    }));
    passport.serializeUser(function (user, cb) {
        cb(null, user);
    });
    passport.deserializeUser(function (obj, cb) {
        cb(null, obj);
    });

    app.use(passport.authenticate(APIStrategy.STRATEGY_NAME, {
        session: false,
        scope: "appid_authenticated"
    }));

    const editorMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    app.use((req, res, next) => {
        if (!editorMethods.includes(req.method) || req?.appIdAuthorizationContext?.accessTokenPayload?.scope?.split(" ").includes("edit")) {
            req.query['email'] = req.user.email;
            next();
        } else {
            res.status(401).json({
                error: {
                    message: "You must have editor role to perform this request."
                }
            });
        }
    });
}