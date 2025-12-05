export const createSubscriber = () => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	const subscribers: Function[] = [];

	const methodDecorator: MethodDecorator = (
		target,
		propertyKey,
		descriptor
	) => {
		const originalMethod = descriptor.value;
		if (typeof originalMethod !== "function") {
			throw new Error("@Subscriber can only be used on methods.");
		}
		subscribers.push(originalMethod);
		return descriptor;
	};

	const dispatchEvent = async (...args: unknown[]) => {
		for (const subscriber of subscribers) {
			try {
				await subscriber(...args);
			} catch (error) {
				console.error(error);
			}
		}
	};

	return [methodDecorator, dispatchEvent] as const;
};
