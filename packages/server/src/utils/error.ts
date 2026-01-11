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

type ServiceErrorCode =
	| "SOURCE_NOT_FOUND"
	| "SOURCE_INITIALIZE_FAILED"
	| "NETWORK_REQUEST_FAILED"
	| "SOURCE_INSTALL_FAILED"
	| "NOT_SUPPORTED"
	| "LOGIN_FAILED";

export class ServiceError extends HTTPError {
	constructor({
		code,
		status,
		message,
		data
	}: {
		code: ServiceErrorCode;
		status: number;
		message: string;
		data?: unknown;
	}) {
		super({
			status,
			message,
			body: {
				code
			},
			data
		});
	}
}

export class NetworkRequestError extends ServiceError {
	constructor(url: string, message: unknown) {
		super({
			code: "NETWORK_REQUEST_FAILED",
			status: 500,
			message: "Network request failed: " + message,
			data: {
				url
			}
		});
	}
}
export class SourceNotFoundError extends ServiceError {
	constructor(id: string) {
		super({
			code: "SOURCE_NOT_FOUND",
			status: 404,
			message: "Source not found: " + id,
			data: {
				id
			}
		});
	}
}
export class SourceInitializeError extends ServiceError {
	constructor(id: string, message: string) {
		super({
			status: 500,
			message: "Failed to initialize source " + id,
			code: "SOURCE_INITIALIZE_FAILED",
			data: {
				id,
				message
			}
		});
	}
}

export class SourceInstallError extends ServiceError {
	constructor(id: string, message: string) {
		super({
			code: "SOURCE_INSTALL_FAILED",
			status: 500,
			message: "Failed to install source: " + id,
			data: {
				id,
				message
			}
		});
	}
}

export class NotSupportedError extends ServiceError {
	constructor(message: string) {
		super({
			code: "NOT_SUPPORTED",
			status: 400,
			message
		});
	}
}

export class LoginFailedError extends ServiceError {
	constructor(message: string) {
		super({
			code: "LOGIN_FAILED",
			status: 400,
			message
		});
	}
}
