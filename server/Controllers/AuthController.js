const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const OTP = require("../Models/OTPModel");
const sendOTP = require("../util/sendOTP");


module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, otp } = req.body;

    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) return res.json({ message: "Invalid or expired OTP" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ message: "User already exists" });

    const user = await User.create({ email, password, username });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    await OTP.deleteMany({ email }); // Clean up used OTPs
    return res.status(201).json({ message: "User registered", success: true });
  } catch (error) {
    console.error(error);
  }
};


module.exports.Login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.json({message: 'All fields are required'})
        }
        const user = await User.findOne({ email });
        if(!user) {
            return res.json({message:'Incorrect password or email'})
        }
        const auth = await bcrypt.compare(password, user.password)
        if(!auth) {
            return res.json({message:'Incorrect  password or email'})
        }
        const token = createSecretToken(user._id);
        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: false,
        });
        res.status(201).json({message: "User logged in successfully", success: true});
        next()
    } catch(error) {
        console.error(error);
    }
};

module.exports.SendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required", success: false });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Save OTP to database
    await OTP.create({ email, otp: otpCode });

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Signup OTP Verification",
      text: `Your OTP code is ${otpCode}. It will expire in 10 minutes.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "OTP sent to email", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send OTP", success: false });
  }
};
