import mongoose from 'mongoose';

const StoryBookSchema = new mongoose.Schema({
    projectID: { type: String, required: true },
    createdBy: { type: String, required: true },
    comment: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true },
    isEmailSent: { type: Boolean, required: true }
});

const StoryBook = mongoose.model('story_book', StoryBookSchema);
export default StoryBook;
