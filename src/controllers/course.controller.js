import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CourseModel } from "../models/course.model.js";
import { uploadOnCloud } from "../services/fileUploder.services.js";

export const createCourse = asyncHandler(async (req, res) => {
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


// Student
export const getCourse = asyncHandler(async (req, res) => {
    const {
        search, //title
        category,
        level,
        language,
        minPrice,
        maxPrice,
        sortBy,
        page = 1,
        limit = 10,
    } = req.query;
    
    const filters = { status: "Published" };

    if (search) {
        filters.$or = [
            {title: { $regex: search, $options: "i" }},
            {description: { $regex: search, $options: "i" }},
        ];
    }

    if (category) filters.category = { $in: [category] };
    if (level) filters.level = level;
    if (language) filters.language = language;
    if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = Number(minPrice);
        if (maxPrice) filters.price.$lte = Number(maxPrice);
    };

    let sort = { createdAt: -1 };
    if (sortBy === "price_low_high") sort = { price: 1};
    if (sortBy === "price_high_low") sort = { price: -1};
    if (sortBy === "rating") sort = { averageRating: -1};

    const course = await CourseModel.find(filters)
        .populate("instructor", "name email avatar")
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort(sort);

    const totalCourses = await CourseModel.countDocuments(filters);

    return res.status(200).json(
        new ApiResponse(200, {
            course,
            pagination: {
                total: totalCourses,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(totalCourses / limit),
            }
        }, "Courses fetched successfully")
    );
});

// Admin
export const getAllCourse = asyncHandler(async (req, res) => {
    const {
        search, //title
        category,
        level,
        language,
        sortBy,
        page = 1,
        limit = 10,
        status //Admin can filter by status
    } = req.query;

    const filters  = {};

    if (search) {
        filters.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    };

    if (category) filters.category = { $in: [category] };
    if (level) filters.level = level;
    if (language) filters.language = language;
    if (status) filters.status = status;

    let sort = { createdAt: -1 };
    if (sortBy === "price_low_high") sort = { price: 1 };
    if (sortBy === "price_high_low") sort = { price: -1 };
    if (sortBy === "rating") sort = { averageRating: -1 };

    const course = await CourseModel.find(filters)
        .populate("instructor", "name email avatar")
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort(sort);

    const totalCourses = await CourseModel.countDocuments(filters);

    return res.status(200).json(
        new ApiResponse(200, {
            course,
            pagination: {
                total: totalCourses,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(totalCourses / limit),
            }
        }, "Courses fetched successfully")
    );
});
