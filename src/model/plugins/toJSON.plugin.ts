import { Document, Schema } from "mongoose";

const toJSON = (schema: Schema) => {
	let transform: ((doc: Document, ret: Record<string, unknown>, options: unknown) => unknown) | undefined;

	const existingToJSON = schema.get("toJSON") as
		| { transform?: (doc: Document, ret: Record<string, unknown>, options: unknown) => unknown }
		| undefined;

	if (existingToJSON?.transform) {
		transform = existingToJSON.transform;
	}

	schema.set("toJSON", {
		transform(doc: Document, ret: Record<string, unknown>, options: unknown) {
			Object.keys(schema.paths).forEach((path) => {
				const schemaPath = schema.paths[path];
				if (schemaPath.options && (schemaPath.options as { private?: boolean }).private) {
					delete ret[path];
				}
			});

			if (ret._id) {
				ret.id = String(ret._id);
				delete ret._id;
			}
			delete ret.__v;

			if (transform) {
				return transform(doc, ret, options);
			}

			return ret;
		},
	} as unknown as Record<string, unknown>);
};

export default toJSON;
