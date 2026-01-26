import axios from 'axios';
import jwt from 'jsonwebtoken';

export class APIProxy {
    private baseUrl: string;
    private openApiSpec: any;

    constructor(baseUrl: string, openApiSpec: any) {
        this.baseUrl = baseUrl;
        this.openApiSpec = openApiSpec;
    }

    async executeFunction(
        functionName: string,
        args: any,
        userToken?: string
    ) {
        // Find the operation in OpenAPI spec
        const operation = this.findOperation(functionName);
        if (!operation) {
            throw new Error(`Function ${functionName} not found in API spec`);
        }

        // Build request
        const { method, path, pathParams, queryParams, body } =
            this.buildRequest(operation, args);

        // Execute with user's auth
        try {
            const response = await axios({
                method,
                url: `${this.baseUrl}${path}`,
                params: queryParams,
                data: body,
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status || 500
            };
        }
    }

    private findOperation(functionName: string) {
        for (const [path, methods] of Object.entries(this.openApiSpec.paths)) {
            for (const [method, operation] of Object.entries(methods as any)) {
                const opId = (operation as any).operationId ||
                    `${method}_${path.replace(/\//g, '_').replace(/[{}]/g, '')}`;
                if (opId === functionName) {
                    return { path, method, ...(operation as any) };
                }
            }
        }
        return null;
    }

    private buildRequest(operation: any, args: any) {
        let path = operation.path;
        const pathParams: any = {};
        const queryParams: any = {};
        let body: any = null;

        // Extract parameters
        if (operation.parameters) {
            for (const param of operation.parameters) {
                if (args[param.name] !== undefined) {
                    if (param.in === 'path') {
                        pathParams[param.name] = args[param.name];
                        path = path.replace(`{${param.name}}`, args[param.name]);
                    } else if (param.in === 'query') {
                        queryParams[param.name] = args[param.name];
                    }
                }
            }
        }

        // Request body
        if (operation.requestBody) {
            // Simplistic assumption: if there's a body, all remaining args go there
            // In a real implementation, we'd map specific body properties
            body = args;
        }

        return {
            method: operation.method.toUpperCase(),
            path,
            pathParams,
            queryParams,
            body
        };
    }
}
