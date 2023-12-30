import vine from '@vinejs/vine';

const appVariablesSchema = vine.object({
	port: vine.number().min(0).max(65535),
	JWT_SECRET: vine.string()
});
export const appVariablesValidator = vine.compile(appVariablesSchema);
