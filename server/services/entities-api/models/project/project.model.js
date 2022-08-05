import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    solution: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true },
    tierIDs: [{ type: String, required: true, default: [] }]
});

const Project = mongoose.model('project', ProjectSchema);
export default Project;
