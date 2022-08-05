import mongoose from 'mongoose';
import { ROLES, ROLES_DESCRIPTION } from '../../entities-api/config/roles.js';

const RolesSchema = new mongoose.Schema({
    cloudspaceID: { type: String, required: true },
    [ROLES.ADMIN]: {
        name: { type: String, required: true, default: ROLES.ADMIN },
        description: { type: String, required: true, default: ROLES_DESCRIPTION.ADMIN },
        updatedDate: { type: Date, required: true, default: new Date() },
        users: [{ type: String, required: true, default: [] }],
        groups: [{ type: String, required: true, default: [] }]
    },
    [ROLES.ADVANCED]: {
        name: { type: String, required: true, default: ROLES.ADVANCED },
        description: { type: String, required: true, default: ROLES_DESCRIPTION.ADVANCED },
        updatedDate: { type: Date, required: true, default: new Date() },
        users: [{ type: String, required: true, default: [] }],
        groups: [{ type: String, required: true, default: [] }]
    },
    [ROLES.BASIC]: {
        name: { type: String, required: true, default: ROLES.BASIC },
        description: { type: String, required: true, default: ROLES_DESCRIPTION.BASIC },
        updatedDate: { type: Date, required: true, default: new Date() },
        users: [{ type: String, required: true, default: [] }],
        groups: [{ type: String, required: true, default: [] }]
    }
});

const Roles = mongoose.model('roles', RolesSchema);
export default Roles;
