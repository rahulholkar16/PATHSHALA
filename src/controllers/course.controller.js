import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CourseModel } from "../models/course.model.js";

const createCourse = asyncHandler(async (req, res) => {
    const {
        titel,
        desription,
        price,
        thumbnail,
        slug,
        category,
        level,
        language,
        status,
    } = req.body;
});
