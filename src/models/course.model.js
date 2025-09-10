import mongoose from "mongoose";
import slugify from "slugify";

const Schema = mongoose.Schema;

/* ---------------- Review Schema ---------------- */
const ReviewSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, trim: true },
    },
    { timestamps: true }
);

/* ---------------- Lecture Schema ---------------- */
const LectureSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        videoUrl: { type: String, required: true },
        videoPublicId: { type: String }, // for cloud deletion
        duration: { type: Number, required: true }, // seconds
        durationFormatted: { type: String }, // e.g., "12:30"
        thumbnail: { type: String },
        thumbnailPublicId: { type: String },
        sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
        instructor: { type: Schema.Types.ObjectId, ref: "User", required: true },
        resourceFiles: [{ type: String }], // PDFs, notes, etc.
        captions: { type: String }, // subtitle file
        transcript: { type: String },
        views: { type: Number, default: 0 },
        order: { type: Number, default: 0 },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

LectureSchema.pre("save", function (next) {
    if (this.duration && !this.durationFormatted) {
        const sec = this.duration % 60;
        const min = Math.floor(this.duration / 60) % 60;
        const hr = Math.floor(this.duration / 3600);
        this.durationFormatted =
            (hr ? hr + ":" : "") +
            (min < 10 ? "0" + min : min) +
            ":" +
            (sec < 10 ? "0" + sec : sec);
    }
    next();
});

LectureSchema.methods.incrementViews = async function () {
    this.views += 1;
    return this.save();
};

/* ---------------- Section Schema ---------------- */
const SectionSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        order: { type: Number, default: 0 },
        courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
        lectures: [{ type: Schema.Types.ObjectId, ref: "Lecture" }],
        duration: { type: Number, default: 0 }, // auto calc
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

SectionSchema.methods.getLectureCount = function () {
    return this.lectures ? this.lectures.length : 0;
};

/* ---------------- Course Schema ---------------- */
const CourseSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        category: { type: [String], required: true }, // tags/categories
        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
            required: true,
        },
        language: {
            type: String,
            enum: ["Hindi", "English", "Hinglish"],
            default: "Hinglish",
            required: true,
        },
        thumbnail: { type: String, required: true },
        instructor: { type: Schema.Types.ObjectId, ref: "User", required: true },
        contributors: [{ type: Schema.Types.ObjectId, ref: "User" }],
        sections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
        enrollStudents: [{ type: Schema.Types.ObjectId, ref: "User" }],

        price: { type: Number, required: true },
        isFree: { type: Boolean, default: false },

        reviews: [ReviewSchema],
        averageRating: { type: Number, default: 0 },

        status: {
            type: String,
            enum: ["Draft", "Published", "Archived"],
            default: "Draft",
        },
        publishedAt: { type: Date },
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

/* ---------------- Hooks & Virtuals ---------------- */
CourseSchema.pre("save", function (next) {
    if (this.isFree) this.price = 0;
    next();
});

CourseSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

CourseSchema.pre("save", function (next) {
    if (this.isModified("status") && this.status === "Published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

CourseSchema.pre("save", function (next) {
    this.lastUpdated = new Date();
    next();
});

CourseSchema.virtual("studentCount").get(function () {
    return this.enrollStudents ? this.enrollStudents.length : 0;
});

CourseSchema.methods.updateAverageRating = async function () {
    if (this.reviews.length === 0) {
        this.averageRating = 0;
    } else {
        const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
        this.averageRating = total / this.reviews.length;
    }
    return await this.save();
};

/* ---------------- Models ---------------- */
export const CourseModel = mongoose.model("Course", CourseSchema);
export const SectionModel = mongoose.model("Section", SectionSchema);
export const LectureModel = mongoose.model("Lecture", LectureSchema);
