type EventName = "swipe" | "click";

export const ZoneFlags = {
	TOP: 1 << 0, // 1
	BOTTOM: 1 << 1, // 2
	LEFT: 1 << 2, // 4
	RIGHT: 1 << 3, // 8
	CENTER: 1 << 4 // 16
} as const;

type Direction = "up" | "down" | "left" | "right";

export class GestureClickEvent extends Event {
	readonly zone: number;
	constructor(zone: number) {
		super("gesture-click");
		this.zone = zone;
	}

	isLeft() {
		return !!(this.zone & ZoneFlags.LEFT);
	}
	isRight() {
		return !!(this.zone & ZoneFlags.RIGHT);
	}
	isTop() {
		return !!(this.zone & ZoneFlags.TOP);
	}
	isCenter() {
		return !!(this.zone & ZoneFlags.CENTER);
	}
	isBottom() {
		return !!(this.zone & ZoneFlags.BOTTOM);
	}
	isCenterOnly() {
		return this.zone === ZoneFlags.CENTER;
	}
}

export class GestureSwipeEvent extends Event {
	readonly deltaX: number;
	readonly deltaY: number;
	readonly duration: number;
	readonly accel: number;
	readonly direction: Direction;
	constructor(
		deltaX: number,
		deltaY: number,
		duration: number,
		accel: number,
		direction: Direction
	) {
		super("gesture-swipe");
		this.deltaX = deltaX;
		this.deltaY = deltaY;
		this.duration = duration;
		this.accel = accel;
		this.direction = direction;
	}
}

interface EventTypeMap {
	click: GestureClickEvent;
	swipe: GestureSwipeEvent;
}

export const useGesture = () => {
	return useMemo(() => {
		const LayerSize = {
			w: document.documentElement.clientWidth,
			h: document.documentElement.clientHeight
		};
		const EventHandler = {
			swipe: new Set<(e: GestureSwipeEvent) => void>(),
			click: new Set<(e: GestureClickEvent) => void>()
		} satisfies Record<EventName, Set<unknown>>;
		let startTouch: Touch | null = null;
		let startTime: number = Date.now();
		const touchList = new Map<number, Touch>();

		return {
			listener: {
				ontouchstart: (e: TouchEvent) => {
					startTouch = e.touches[0];
					startTime = Date.now();
					for (const touch of e.touches) {
						touchList.set(touch.identifier, touch);
					}
				},
				ontouchmove: (e: TouchEvent) => {
					void e;
				},
				ontouchend: (e: TouchEvent) => {
					const touches = Array.from(e.changedTouches);
					const endTouch = touches.find(
						v => v.identifier === startTouch?.identifier
					);
					if (startTouch && endTouch) {
						const deltaX = endTouch.clientX - startTouch.clientX;
						const deltaY = endTouch.clientY - startTouch.clientY;
						const duration = Date.now() - startTime;
						const accel = Math.sqrt(deltaX ** 2 + deltaY ** 2) / duration;
						if (accel > 0.1) {
							let direction: Direction;
							if (Math.abs(deltaX) > Math.abs(deltaY)) {
								direction = deltaX > 0 ? "right" : "left";
							} else {
								direction = deltaY > 0 ? "down" : "up";
							}
							const e = new GestureSwipeEvent(
								deltaX,
								deltaY,
								duration,
								accel,
								direction
							);
							for (const listener of EventHandler.swipe) {
								listener(e);
								if (e.defaultPrevented) break;
							}
						} else {
							const zoneWidth = LayerSize.w / 3;
							const zoneHeight = LayerSize.h / 3;

							const x = startTouch.clientX;
							const y = startTouch.clientY;

							const colIndex = Math.floor(x / zoneWidth);
							const rowIndex = Math.floor(y / zoneHeight);

							let zone = 0;
							if (rowIndex === 0) zone |= ZoneFlags.TOP;
							else if (rowIndex === 2) zone |= ZoneFlags.BOTTOM;

							if (colIndex === 0) zone |= ZoneFlags.LEFT;
							else if (colIndex === 2) zone |= ZoneFlags.RIGHT;

							if (rowIndex === 1 || colIndex === 1) zone |= ZoneFlags.CENTER;

							const e = new GestureClickEvent(zone);
							for (const listener of EventHandler.click) {
								listener(e);
								if (e.defaultPrevented) break;
							}
						}
					}
					for (const touch of touches) {
						touchList.delete(touch.identifier);
					}
					if (touchList.size === 0) {
						startTouch = null;
					}
				},
				ontouchcancel: (e: TouchEvent) => {
					for (const touch of e.touches) {
						touchList.delete(touch.identifier);
					}
				}
			},
			useGesture<T extends EventName>(
				e: T,
				handler: (e: EventTypeMap[T]) => void,
				deps?: unknown[]
			) {
				useEffect(() => {
					EventHandler[e].add(handler as never);
					return () => {
						EventHandler[e].delete(handler as never);
					};
				}, deps);
			}
		};
	}, []);
};
