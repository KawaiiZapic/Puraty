import { HTTPError } from "h3";

export const createHttpError = (
	code: number,
	message: string,
	err?: unknown
) => {
	return new HTTPError(message, {
		status: code,
		cause: err,
		stack: err instanceof Error ? err.stack : undefined
	});
};
