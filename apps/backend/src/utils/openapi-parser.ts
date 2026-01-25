import SwaggerParser from '@apidevtools/swagger-parser';
import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import axios from 'axios';
import yaml from 'js-yaml';

export class OpenAPIParser {
    async parseSpec(specUrl: string): Promise<any> {
        try {
            // Fetch the spec file first
            const response = await axios.get(specUrl);
            let specContent = response.data;

            // If it's a string (YAML), parse it
            if (typeof specContent === 'string') {
                specContent = yaml.load(specContent);
            }

            // Dereference any $ref pointers
            const api = await SwaggerParser.dereference(specContent);
            return api;
        } catch (error: any) {
            throw new Error(`Failed to parse OpenAPI spec: ${error.message}`);
        }
    }

    generateTools(openApiSpec: any): FunctionDeclaration[] {
        const tools: FunctionDeclaration[] = [];
        const paths = openApiSpec.paths;

        for (const [path, methods] of Object.entries(paths)) {
            for (const [method, operation] of Object.entries(methods as any)) {
                if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
                    tools.push(this.createFunctionDeclaration(
                        path,
                        method,
                        operation
                    ));
                }
            }
        }

        return tools;
    }

    private createFunctionDeclaration(
        path: string,
        method: string,
        operation: any
    ): FunctionDeclaration {
        const functionName = operation.operationId ||
            `${method}_${path.replace(/\//g, '_').replace(/[{}]/g, '')}`;

        const parameters = this.extractParameters(operation);

        return {
            name: functionName,
            description: operation.summary || operation.description ||
                `Execute ${method.toUpperCase()} ${path}`,
            parameters: {
                type: SchemaType.OBJECT,
                properties: parameters.properties,
                required: parameters.required
            }
        };
    }

    private extractParameters(operation: any) {
        const properties: any = {};
        const required: string[] = [];

        // Path parameters
        if (operation.parameters) {
            for (const param of operation.parameters) {
                properties[param.name] = {
                    type: this.mapType(param.schema?.type || 'string'),
                    description: param.description
                };
                if (param.required) required.push(param.name);
            }
        }

        // Request body
        if (operation.requestBody?.content?.['application/json']?.schema) {
            const schema = operation.requestBody.content['application/json'].schema;
            if (schema.properties) {
                Object.assign(properties, this.convertSchemaProperties(schema.properties));
                if (schema.required) required.push(...schema.required);
            }
        }

        return { properties, required };
    }

    private convertSchemaProperties(props: any): any {
        const converted: any = {};
        for (const [key, value] of Object.entries(props)) {
            const prop = value as any;
            converted[key] = {
                type: this.mapType(prop.type),
                description: prop.description
            };
        }
        return converted;
    }

    private mapType(type: string): SchemaType {
        const typeMap: Record<string, SchemaType> = {
            'integer': SchemaType.NUMBER,
            'number': SchemaType.NUMBER,
            'boolean': SchemaType.BOOLEAN,
            'array': SchemaType.ARRAY,
            'object': SchemaType.OBJECT,
            'string': SchemaType.STRING
        };
        return typeMap[type] || SchemaType.STRING;
    }
}
