import mongoose from "mongoose";
import slugify from "slugify";

const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, trim: true },
    },
    { timestamps: true }
);

const CourseSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        category: { type: [String], required: true }, // array of strings
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

CourseSchema.pre("save", function (next) {
    if(this.isFree) {
        this.price = 0;
    }
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
}

export const CourseModel = mongoose.model("Course", CourseSchema);
