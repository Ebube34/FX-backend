import dotenv from "dotenv";
import express from "express";
import dbConnect from "./db/dbConnect.js";
import bodyParser from "body-parser";
import  User  from "./db/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import nodemailer  from "nodemailer"
import cors from "cors";





// require("dotenv").config();
// const express = require("express");
// const app = express();
// const bodyParser = require("body-parser");
// const dbConnect = require("./db/dbConnect");
// const User = require("./db/userModel");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");


dotenv.config();
const app = express();
dbConnect();
const saltRounds = 6;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors())
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const companyEmail = process.env.myemail;
const companyPass = process.env.emailpassword;

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: companyEmail,
    pass: companyPass,
  },
});

app.get("/", (req, res, next) => {
  res.json({ message: "Hey! This is your server response!" });
  next();
});

app.get("/confirm/:confirmationCode", function (req, res) {
  User.findOne({
    confirmationCode: req.params.confirmationCode,
  })
    .then((user) => {
      user.status = "Active";
      user
        .save()
        .then(() => {
          res.status(200).json({
            message: "you have succesfully Verified your account! please login",
          });
        })
        .catch((e) => {
          res.status(404).send({
            message: "error while updating user status",
            e,
          });
        });
    })
    .catch((err) => {
      res.status(400).send({
        message: "could not find user",
        err,
      });
    });
});

app.post("/register", function (req, res) {
  const token = jwt.sign(
    { email: req.body.email, tokenName: req.body.firstName },
    process.env.secret
  );
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    if (err) {
      return res.status(500).send({
        message: "password was not hashed successfully",
        err,
      });
    } else {
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        password: hash,
        confirmationCode: token,
      });

      newUser.save(function (err) {
        if (err) {
          return res.status(500).send({
            message: "Error creacting user",
            err,
          });
        } else {
          transport.sendMail({
            from: companyEmail,
            to: newUser.email,
            subject: "ACCOUNT VERIFICATION",
            html: `            <div style="text-align:center; background-color:#024959; padding:2em 1em 3em 1em; ">
                <h1 style="color:white">Hello ${newUser.firstName}</h1>

                <div style="padding:4em 2em; background-color:white; border-radius:10px;">
                  <h2>Verify your email address</h2>
                  <p>We are exited to have you as an investor. In order to start using your account you need to confirm your email address. click on the link bellow </p>
                    <a href=https://investmentfx.netlify.app/confirm/${newUser.confirmationCode}> Click here</a>
                    <p>
                      Or copy the following link and paste in a new browser tab
                    </p>
                    <p>
                      <a href=https://investmentfx.netlify.app/confirm/${newUser.confirmationCode}>https://investmentfx.netlify.app/confirm/${newUser.confirmationCode}</a>
                    </p>
                    <div style="border-bottom:1px solid black; width:100%">

                    </div>
                    <p style="font-style:italic; font-size:1em">if you did not sign up for this account you can ignore this email and your account will be deleted.</p>
                </div>
            </div>`,
          });

          res.status(201).send({
            message: "User Created succrssfully! please check your email",
          });
        }
      });
    }
  });
});

app.post("/login", function (req, res) {
  User.findOne({ email: req.body.email })
    .then((user) => {
      bcrypt
        .compare(req.body.password, user.password)
        .then((passwordCheck) => {
          if (!passwordCheck) {
            return res.status(400).send({
              message: "password does not match",
            });
          } else {
            if (user.status != "Active") {
              return res.status(400).send({
                message: "Pending Account. Please Verify Your Email!",
              });
            }
            const token = jwt.sign(
              {
                userId: user._id,
                userEmail: user.email,
              },
              "RANDOM-TOKEN",
              { expiresIn: "24h" }
            );

            res.status(200).send({
              message: "Login Successful",
              userId: user._id,
              token,
            });
          }
        })
        .catch((error) => {
          res.status(400).send({
            message: "password does not match",
            error,
          });
        });
    })
    .catch((e) => {
      res.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

app.post("/how/forgot-password", function (req, res) {
  const userPassword = req.body.userPasswordInput;
  const userEmail = req.body.userEmailInput;
  bcrypt.hash(userPassword, saltRounds, function (err, hash) {
    if (err) {
      return res.status(400).send({
        message: "password was not hashed successufully hashed",
      });
    } else {
      User.findOne({ email: userEmail })
        .then((user) => {
          user.password = hash;
          user
            .save()
            .then((newUser) => {
              const day = new Date();
              transport.sendMail({
                from: companyEmail,
                to: newUser.email,
                subject: "PASSWORD CHANGE",
                html: `        <div style="text-align:center; background-color:#024959; padding:2em 1em 3em 1em; ">
          <h1 style="color:white">Hello ${newUser.firstName}</h1>
  
          <div style="padding:4em 2em; background-color:white; border-radius:10px;">
            <h2>password Change Confirmation</h2>
            <p>  Your password was successfully changed.  </p>
            <p>
              Time: ${day}
            </p>
            <div style="border-bottom:1px solid black; width:100%">

            </div>
            <p style="font-style:italic; font-size:1em">if this wasn't you kindly report your acccout for malicious access, vist our support team for help.</p>
                             
          </div>
      </div>
            `,
              });

              res.status(200).send({
                message: "successfully changed your password!",
              });
            })
            .catch((err) => {
              res.status(401).send({
                message: "error while updating user password!",
                err,
              });
            });
        })
        .catch((error) => {
          res.status(400).send({
            message: "could not find user with the provided email",
            error,
          });
        });
    }
  });
});

// dashboard endpoint

app.get("/general/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).send(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

export default app;
