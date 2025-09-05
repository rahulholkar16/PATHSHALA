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
    const { role } = req.role;

    const isExist = await UserModel.findOne({ email });
    if (isExist) throw new ApiError(409, "User already exists", []);

    const newUser = await UserModel.create({
        email,
        name,
        password,
        isVerified: false
    });

    const { unHashedToken, hashedToken, tokenExpiry } = newUser.generateTempToken();

    newUser.verificationToken = hashedToken;
    newUser.verificationTokenExpire = tokenExpiry;

    await user.save({ validateBeforeSave: false });
    await sendEmail({
        email: newUser.email,
        subject: "Plesase verify your email.",
        mailgenContent: emailVerificationContent(newUser.name, `${req.protocal}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}`),
    })

    const data = await UserModel.findById(user._id).select(
        "-password -verificationToken -resetPasswordToken -refreshToken"
    )

    if (!data) throw new ApiError(500, "Something went wrong while Register a User.");

    return res.status(200).json(
        new ApiResponse(200, { user: data }, "User added successfully and verification email send")
    )
});

export { registerUser };