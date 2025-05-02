"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
const api_1 = require("./../auth/api");
const expressAuth_1 = require("./../auth/expressAuth");
const expressAuthenticationRecasted = expressAuth_1.expressAuthentication;
const models = {
    "Authenticated": {
        "dataType": "refObject",
        "properties": {
            "name": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    "Credentials": {
        "dataType": "refObject",
        "properties": {
            "email": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
};
const templateService = new runtime_1.ExpressTemplateService(models, { "noImplicitAdditionalProperties": "throw-on-extras", "bodyCoercion": true });
function RegisterRoutes(app) {
    const argsAuthController_login = {
        credentials: { "in": "body", "name": "credentials", "required": true, "ref": "Credentials" },
    };
    app.post('/auth/login', ...((0, runtime_1.fetchMiddlewares)(api_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(api_1.AuthController.prototype.login)), async function AuthController_login(request, response, next) {
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });
            const controller = new api_1.AuthController();
            await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    const argsAuthController_status = {};
    app.get('/auth/status', ...((0, runtime_1.fetchMiddlewares)(api_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(api_1.AuthController.prototype.status)), async function AuthController_status(request, response, next) {
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_status, request, response });
            const controller = new api_1.AuthController();
            await templateService.apiHandler({
                methodName: 'status',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
}
