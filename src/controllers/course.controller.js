import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CourseModel, LectureModel, SectionModel } from "../models/course.model.js";
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

    res.status(200).json(new ApiResponse(200, newCourse, "course added successfully."));
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
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
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

    const filters = {};

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

export const updateCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const course = await CourseModel.findById(courseId);
    if (!course) throw new ApiError(400, "Course not found.");

    const {
        title,
        description,
        price,
        category,
        level,
        language,
        status,
    } = req.body;

    if (req.file?.path) {
        const thumbnail = await uploadOnCloud(req.file.path);
        course.thumbnail = thumbnail || thumbnail.url;
    };

    if (title) course.title = title;
    if (description) course.description = description;
    if (language) course.language = language;
    if (level) course.level = level;
    if (price) course.price = Number(price);
    if (status) course.status = status;
    if (category) course.category = Array.isArray(category) ? category : category.split(",");

    await course.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, course, "Course update successfully.")
    );
});

export const deleteCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await CourseModel.findById(courseId);
    if (!course) throw new ApiError(400, "Course not found.");

    await CourseModel.findByIdAndDelete(courseId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Course delete successfully!")
    );
});

export const addSection = asyncHandler(async (req, res) => {
    const { title, description, order } = req.body;
    const { courseId } = req.params;


    if (!title || !description || !order || !courseId) throw new ApiError(400, "All fields are required.");

    const isCourse = await CourseModel.findById(courseId);
    if (!isCourse) throw new ApiError(404, "Course not found");
    const isTitle = await SectionModel.findOne({ title, courseId });
    if (isTitle) throw new ApiError(409, "Duplicate title");

    const newSection = await SectionModel.create({
        title,
        description,
        order,
        courseId
    });

    return res.status(200).json(
        new ApiResponse(200, newSection, "Section add successfully.")
    );
});

export const updateSection = asyncHandler(async (req, res) => {
    const { title, description, order } = req.body;
    const { sectionId } = req.params;

    const update = {};
    if (title) update.title = title;
    if (description) update.description = description;
    if (order) update.order = order;

    const section = await SectionModel.findByIdAndUpdate(sectionId, { $set: update }, { new: true, runValidators: true });
    if (!section) throw new ApiError(404, "Section not found");

    return res.status(200).json(
        new ApiResponse(200, section, "Section updated")
    );
});

export const deleteSection = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;

    if (!sectionId) throw new ApiError(404, "Section not found.");
    const section = await SectionModel.findByIdAndDelete(sectionId);

    if (!section) throw new ApiError(404, "Section not found.");

    return res.status(200).json(
        new ApiResponse(200, {}, "Section delete successfully.")
    )
});

export const addLecture = asyncHandler(async (req, res) => {
    const { title, description, duration, order } = req.body;
    const { courseId, sectionId } = req.query;
    const user = req.user;

    if (!courseId || !sectionId) throw new ApiError(400, "Course ID and Section ID are required!");
    if (!title || !description || duration == null || order == null) {
        throw new ApiError(400, "Title, description, duration, and order are required!");
    }

    if (!req.files?.video || !req.files?.thumbnail || !req.files?.pdf) {
        throw new ApiError(400, "Video, Thumbnail, and PDF are required!");
    }

    // Upload all files in parallel
    const [videoUrl, thumbnailUrl, pdfUrl] = await Promise.all([
        uploadOnCloud(req.files.video[0].path),
        uploadOnCloud(req.files.thumbnail[0].path),
        uploadOnCloud(req.files.pdf[0].path),
    ]);

    const newLecture = await LectureModel.create({
        title,
        description,
        videoUrl: videoUrl.url,
        videoPublicId: videoUrl.public_id,
        duration,
        thumbnail: thumbnailUrl.url,
        thumbnailPublicId: thumbnailUrl.public_id,
        courseId,
        sectionId,
        instructor: user._id,
        resourceFiles: pdfUrl.url,
        order,
    });

    return res.status(201).json(
        new ApiResponse(201, newLecture, "Lecture added successfully.")
    );
});

export const updateLecture = asyncHandler(async (req, res) => {
    const { title, description, duration, order } = req.body;
    const { lectureId } = req.params;

    if(!lectureId) throw new ApiError(404, "Lecture Id not found!");

    const update = {}
    if (req.files.video[0].path) {
        const videoUrl = await uploadOnCloud(req.files.video[0].path);
        update.videoUrl = videoUrl.url;
        update.videoPublicId = videoUrl.public_id;
    };

    if (req.files.thumbnail[0].path) {
        const thumbnail = await uploadOnCloud(req.files.thumbnail[0].path);
        update.thumbnail = thumbnail.url;
        update.thumbnailPublicId = thumbnail.public_id;
    };

    if (req.files.pdf[0].path) {
        const pdfUrl = await uploadOnCloud(req.files.pdf[0].path);
        update.resourceFiles = pdfUrl.url;
    };

    if(title) update.title = title;
    if(description) update.description = description;
    if(duration) update.duration = duration;
    if(order) update.order = order;

    const lecture = await LectureModel.findByIdAndUpdate(lectureId, { $set: update }, { new: true, runValidators: true });
    if (!lecture) throw new ApiError(404, "Section not found");

    return res.status(200).json(
        new ApiResponse(200, lecture, "Lecture update successfully.")
    );
});