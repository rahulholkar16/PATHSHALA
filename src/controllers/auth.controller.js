import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserModel } from "../models/user.model.js";
import { sendEmail, emailVerificationContent } from "../services/sendMail.services.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await UserModel.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token.")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.validateData;
    const role = req.role;

    // avoid duplicate user
    const isExist = await UserModel.findOne({ email });
    if (isExist) throw new ApiError(409, "User already exists", []);

    // add in db
    const newUser = await UserModel.create({
        email,
        name,
        password,
        isVerified: false,
        role
    });

    const { unHashedToken, hashedToken, tokenExpiry } = newUser.generateTempToken();

    newUser.verificationToken = hashedToken;
    newUser.verificationTokenExpire = tokenExpiry;

    await newUser.save({ validateBeforeSave: false });

    // Send mail
    await sendEmail({
        email: newUser.email,
        subject: "Plesase verify your email.",
        mailgenContent: emailVerificationContent(newUser.name, `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}`),
    })
    
    const data = await UserModel.findById(newUser._id).select(
        "-password -verificationToken -resetPasswordToken -refreshToken"
    )

    if (!data) throw new ApiError(500, "Something went wrong while Register a User.");

    return res.status(200).json(
        new ApiResponse(200, { user: data }, "User added successfully and verification email send")
    )
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) throw new ApiError(400, "Email and Password is required."); 

    const user = await UserModel.findOne({ email });

    if(!user) throw new ApiError(400, "User does not exists!");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) throw new ApiError(400, "Invalid Password");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await UserModel.findById(user._id).select(
        "-password -verificationToken -resetPasswordToken -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully."
            )
        );
})

const logoutUser = asyncHandler(async (req, res) => {
    await UserModel.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: "",
            }
        },
        {
            new: true,
        },
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current User fetched successfully."));
})

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;
    if(!verificationToken) throw new ApiError(400, "Email verfication token is missing.");

    let hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const user = await UserModel.findOne({ verificationToken: hashedToken, verificationTokenExpire: {$gt: Date.now()} });
    if(!user) throw new ApiError(400, "Token is invalid or expired");


    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    user.isVerified = true;
    await user.save({validateBeforeSave: false});

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isEmailVerified: true
                },
                "Email is verified"
            )
        )
})
// const getCurrentUser = asyncHandler(async (req, res) => {

// })

export { registerUser, loginUser, logoutUser, getCurrentUser, verifyEmail };