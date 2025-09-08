import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CourseModel } from "../models/course.model.js";
import { uploadOnCloud } from "../services/fileUploder.services.js";

const createCourse = asyncHandler(async (req, res) => {
    const user = req.user;
    const {
        title,
        description,
        price,
        category,
        level,
        language,
        status,
    } = req.body;
    
    let thumbnailUrl = null;

    if (req.file?.path) {
        thumbnailUrl = await uploadOnCloud(req.file.path);
    } else {
        throw new ApiError(400, "Thumbnail is required!");
    }

    if (
        !title ||
        !description ||
        !price ||
        !category ||
        !level ||
        !language ||
        !status
    ) {
        throw new ApiError(400, "All fields are required!");
    };

    if (!Array.isArray(category) || category.length === 0) {
        throw new ApiError(400, "At least one category is required!");
    }

    const newCourse = await CourseModel.create({
        title,
        description,
        language,
        price: Number(price),
        category,
        level,
        status,
        thumbnail: thumbnailUrl.url,
        instructor: user._id
    });

    res.status(200).json( new ApiResponse(200, newCourse, "course added successfully."));
});
