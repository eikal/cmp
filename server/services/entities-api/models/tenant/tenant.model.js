import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
    tierID: { type: String, required: true },
    keycloakURL: { type: String, required: true },
    cfrmApiGatewayURL: { type: String, required: true },
    keycloakUsername: { type: String, required: true },
    keycloakPassword: { type: String, required: true },
    keycloakClientID: { type: String, required: true },
    keycloakGrantType: { type: String, required: true },
    cfrmUsername: { type: String, required: true },
    cfrmPassword: { type: String, required: true },
    cfrmClientID: { type: String, required: true },
    cfrmGrantType: { type: String, required: true },
    dbUsername: { type: String, required: false },
    dbPassword: { type: String, required: false },
    dbConnectionString: { type: String, required: false },
    dbHomePath: { type: String, required: false },
    apacheHostname: { type: String, required: false },
    apachePort: { type: String, required: false },
    apacheUsername: { type: String, required: false },
    apachePassword: { type: String, required: false }
});

const Tenant = mongoose.model('tenant', TenantSchema);
export default Tenant;
