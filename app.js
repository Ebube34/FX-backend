import dotenv from "dotenv";
import express from "express";
import dbConnect from "./db/dbConnect.js";
import bodyParser from "body-parser";
import User from "./db/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import nodemailer from "nodemailer";
import cors from "cors";
import Contract from "./db/contracts.js";
import Deposits from "./db/transactionHistory.js";
import Withdrawals from "./db/withdrawal.js";

dotenv.config();
const app = express();
dbConnect();
const saltRounds = 6;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
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

// const companyEmail = process.env.myemail;
// const companyPass = process.env.emailpassword;

// const transport = nodemailer.createTransport({
//   host: 'smtp.forwardemail.net',
//   port: 465,
//   secure: true,
//   auth: {
//     user: companyEmail,
//     pass: companyPass,
//   },
// });

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
      return res.status(401).send({
        message: "Registration failed, try again",
        err,
      });
    } else {
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        country: req.body.country,
        password: hash,
        confirmationCode: token,
        walletBalance: 0,
        capitalInvested: 0,
        earnings: 0,
        totalEarnings: 0,
        noOfActiveContracts: 0,
      });

      newUser.save(function (err) {
        if (err) {
          return res.status(500).send({
            message: "Registration failed try again",
            err,
          });
        } else {
          // transport.sendMail({
          //   from: companyEmail,
          //   to: newUser.email,
          //   subject: "ACCOUNT VERIFICATION",
          //   html: `            <div style="text-align:center; background-color:#024959; padding:2em 1em 3em 1em; ">
          //       <h1 style="color:white">Hello ${newUser.firstName}</h1>

          //       <div style="padding:4em 2em; background-color:white; border-radius:10px;">
          //         <h2>Verify your email address</h2>
          //         <p>We are exited to have you as an investor. In order to start using your account you need to confirm your email address. click on the link bellow </p>
          //           <a href=https://investmentfx.netlify.app/confirm/${newUser.confirmationCode}> Click here</a>
          //           <p>
          //             Or copy the following link and paste in a new browser tab
          //           </p>
          //           <p>
          //             <a href=https://investmentfx.netlify.app/confirm/${newUser.confirmationCode}>https://investmentfx.netlify.app/confirm/${newUser.confirmationCode}</a>
          //           </p>
          //           <div style="border-bottom:1px solid black; width:100%">

          //           </div>
          //           <p style="font-style:italic; font-size:1em">if you did not sign up for this account you can ignore this email and your account will be deleted.</p>
          //       </div>
          //   </div>`,
          // });

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
            return res.status(401).json({
              message: "Incorrect password",
            });
          } else {
            // if (user.status != "Active") {
            // transport.sendMail({
            //   from: companyEmail,
            //   to: newUser.email,
            //   subject: "ACCOUNT VERIFICATION",
            //   html: `            <div style="text-align:center; background-color:#024959; padding:2em 1em 3em 1em; ">
            //       <h1 style="color:white">Hello ${newUser.firstName}</h1>

            //       <div style="padding:4em 2em; background-color:white; border-radius:10px;">
            //         <h2>Verify your email address</h2>
            //         <p>We are exited to have you as an investor. In order to start using your account you need to confirm your email address. click on the link bellow </p>
            //           <a href=https://investmentfx.netlify.app/confirm/${newUser.confirmationCode}> Click here</a>
            //           <p>
            //             Or copy the following link and paste in a new browser tab
            //           </p>
            //           <p>
            //             <a href=https://investmentfx.netlify.app/confirm/${newUser.confirmationCode}>https://investmentfx.netlify.app/confirm/${newUser.confirmationCode}</a>
            //           </p>
            //           <div style="border-bottom:1px solid black; width:100%">

            //           </div>
            //           <p style="font-style:italic; font-size:1em">if you did not sign up for this account you can ignore this email and your account will be deleted.</p>
            //       </div>
            //   </div>`,
            // });
            //   return res.status(403).send({
            //     message: "Pending Account. Please Verify Your Email!",
            //   });
            // }
            

            res.status(200).send({
              message: "Login Successful",
              userId: user._id,
              name: user.firstName,
            });
          }
        })
        .catch((errors) => {
          res.status(402).send({
            message: "password does not match",
            errors,
          });
        });
    })
    .catch((e) => {
      res.status(404).send({
        message: "Not found try again",
        e,
      });
    });
});

app.post("/how/reset-password", function (req, res) {
  const userPassword = req.body.password;
  const userEmail = req.body.email;
  bcrypt.hash(userPassword, saltRounds, function (err, hash) {
    if (err) {
      return res.status(400).send({
        message: "Password was not secured successufully, try again",
      });
    } else {
      User.findOne({ email: userEmail })
        .then((user) => {
          user.password = hash;
          user
            .save()
            .then((newUser) => {
              const dateObject = new Date();

              
  const day = dateObject.getDate();
  const month = dateObject.getMonth();
  const year = dateObject.getFullYear();
  const editedDateObject = new Date(year, month, day);
  const editedMonth = editedDateObject.toLocaleString("default", {
    month: "short",
  });
  var hours = dateObject.getHours();
  var minutes = dateObject.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; 
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + "" + ampm;

  const dateString =
    strTime + " " + day.toString() + " " + editedMonth + ", " + year.toString();


              //         transport.sendMail({
              // Send user email about password reset if it wasent them contact support immdiately 

              res.status(200).send({
                message: "Successfully changed your password!",
                userId: newUser._id,
                name: newUser.firstName,
              });
            })
            .catch((err) => {
              res.status(401).send({
                message: "Password reset failed, try again",
                err,
              });
            });
        })
        .catch((error) => {
          res.status(400).send({
            message:
              "Could not find your email. Use email you registered with.",
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
    const user = await User.findById(id).select("-password");

    res.status(200).send(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.get("/general/contract/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    res.status(200).send(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/contract/contract-purchase", (req, res) => {
  const contractDetails = {
    percentageProfit: req.body.percentageProfitValue,
    capital: req.body.capitalAmount,
    investmentType: req.body.investmentType,
    investmentPlan: req.body.investmentPlan,
    _Id: req.body.userId,
    rating: req.body.rating,
  };
  const changeCapitalAmountToNumber = parseInt(contractDetails.capital, 10);
  const profitPerMonthValue =
    (contractDetails.percentageProfit / 100) * changeCapitalAmountToNumber;
  const percentagePlusCapital =
    changeCapitalAmountToNumber + profitPerMonthValue;

  const dateOfPurchaseObject = new Date();
  const dayOfPurchase = dateOfPurchaseObject.getDate();
  const monthOfPurchase = dateOfPurchaseObject.getMonth();
  const yearOfPurchase = dateOfPurchaseObject.getFullYear();
  const dateOfPurchaseEiditedObject = new Date(
    yearOfPurchase,
    monthOfPurchase,
    dayOfPurchase
  );
  const monthInWords = dateOfPurchaseEiditedObject.toLocaleString("default", {
    month: "short",
  });
  const dateOfPurchaseString =
    dayOfPurchase.toString() +
    " " +
    monthInWords +
    ", " +
    yearOfPurchase.toString();

  const dateOfPaymentObject = new Date(
    dateOfPurchaseObject.setDate(dateOfPurchaseObject.getDate() + 31)
  );
  const dayOfPayment = dateOfPaymentObject.getDate();
  const monthOfPayment = dateOfPaymentObject.getMonth();
  const yearOfPayment = dateOfPaymentObject.getFullYear();
  const dateOfPaymentEiditedObject = new Date(
    yearOfPayment,
    monthOfPayment,
    dayOfPayment
  );
  const monthInWords2 = dateOfPaymentEiditedObject.toLocaleString("default", {
    month: "short",
  });
  const dateOfPaymentString =
    dayOfPayment.toString() +
    " " +
    monthInWords2 +
    ", " +
    yearOfPayment.toString();

  const newContract = new Contract({
    investmentType: contractDetails.investmentType,
    investmentPlan: contractDetails.investmentPlan,
    userId: contractDetails._Id,
    percentageProfit: contractDetails.percentageProfit,
    profitPerMonth: profitPerMonthValue,
    capital: changeCapitalAmountToNumber,
    capitalPlusProfit: percentagePlusCapital,
    dateOfPurchase: dateOfPurchaseString,
    dateOfPayment: dateOfPaymentString,
    rating: contractDetails.rating,
  });

  newContract.save((err, contractResult) => {
    if (err) {
      return res.status(500).send({
        message: "contract was not saved to our data. Please try again!",
        err,
      });
    } else {
      User.findOne({ _id: contractDetails._Id })
        .then((user) => {
          const totalCapital =
            user.capitalInvested + changeCapitalAmountToNumber;
          const earnings = user.earnings + contractResult.profitPerMonth;
          const totalEarnings = user.totalEarnings + percentagePlusCapital;
          const newWalletBalance =
            user.walletBalance - changeCapitalAmountToNumber;

          user.activeContracts.push(contractResult);
          user.capitalInvested = totalCapital;
          user.totalEarnings = totalEarnings;
          user.noOfActiveContracts++;
          user.walletBalance = newWalletBalance;
          user.earnings = earnings;
          user
            .save()
            .then(() => {
              res.status(200).send({
                message: "Contract have been successfully purchased",
              });
            })
            .catch((err) => {
              res.status(500).send({
                message: "contract was not saved to user",
                err,
              });
            });
        })
        .catch((err) => {
          return res.status(500).send({
            message: "User was not found through their id",
            err,
          });
        });
    }
  });
});

app.post("/deposits", (req, res) => {
  const details = {
    amount: req.body.amount,
    userId: req.body.userId,
    network: req.body.network,
    address: req.body.address,
  };

  const dateObject = new Date();

  const day = dateObject.getDate();
  const month = dateObject.getMonth();
  const year = dateObject.getFullYear();
  const editedDateObject = new Date(year, month, day);
  const editedMonth = editedDateObject.toLocaleString("default", {
    month: "short",
  });
  var hours = dateObject.getHours();
  var minutes = dateObject.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; 
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + "" + ampm;

  const dateString =
    strTime + " " + day.toString() + " " + editedMonth + ", " + year.toString();

  const deposit = new Deposits({
    userId: details.userId,
    amount: details.amount,
    network: details.network,
    date: dateString,
    address: details.address,
  });

  deposit.save((err, result) => {
    if (err) {
      return res.status(500).send({
        err,
        message: "Transaction failed, try again",
      });
    } else {
      User.findOne({ _id: details.userId })
        .then((user) => {
          user.deposits.push(result);
          user
            .save()
            .then(() => {
              return res
                .status(200)
                .send({ message: "transaction successful" });
            })
            .catch((err) => {
              return res.status(400).send({
                message: "Transaction not recorded",
              });
            });
        })
        .catch((error) => {
          return res.status(404).send({
            error,
            message: "User not found",
          });
        });
    }
  });
});

app.post("/withdrawals", (req, res) => {
  const details = {
    amount: req.body.amount,
    userId: req.body.userId,
    network: req.body.network,
    address: req.body.walletAddress,
  };

  const dateObject = new Date();

  const day = dateObject.getDate();
  const month = dateObject.getMonth();
  const year = dateObject.getFullYear();
  const editedDateObject = new Date(year, month, day);
  const editedMonth = editedDateObject.toLocaleString("default", {
    month: "short",
  });

  var hours = dateObject.getHours();
  var minutes = dateObject.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + "" + ampm;

  const dateString =
    strTime + " " + day.toString() + " " + editedMonth + ", " + year.toString();

  User.findOne({ _id: details.userId })
    .then((user) => {
      if (user.walletBalance < details.amount) {
        return res.status(400).send({
          message: "You do not have sufficient amount for withdrawal",
        });
      } else {
        const withdrawal = new Withdrawals({
          userId: details.userId,
          address: details.address,
          date: dateString,
          network: details.network,
          amount: details.amount,
        });

        withdrawal
          .save()
          .then((result) => {
            user.withdrawals.push(result);
            user
              .save()
              .then(() => {
                return res
                  .status(200)
                  .send({ message: "Withdrawal successful" });
              })
              .catch((error) => {
                return res.status(404).send({
                  error,
                  message: "Process ended with sever error, try again",
                });
              });
          })
          .catch((error) => {
            return res.status(500).send({
              error,
              message: "Process ended with sever error, try again",
            });
          });
      }
    })
    .catch((error) => {
      return res.status(404).send({
        error,
        message: "User not found",
      });
    });
});

export default app;
