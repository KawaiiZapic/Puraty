import type { FunctionalComponent, VNode } from "preact";
import type { Dispatch } from "preact/hooks";

const TeleportContext = createContext<
	Dispatch<{
		type: string;
		VNode: VNode;
	}>
>(null as never);

export const TeleportWrapper: FunctionalComponent = ({ children }) => {
	const [list, updateList] = useReducer(
		(
			state,
			action: {
				type: string;
				VNode: VNode;
			}
		) => {
			switch (action.type) {
				case "remove":
					return state.filter(item => item !== action.VNode);
				default:
					return [...state, action.VNode];
			}
		},
		[] as VNode[]
	);
	return (
		<TeleportContext.Provider value={updateList}>
			{children}
			{list.map(item => (
				<>{item}</>
			))}
		</TeleportContext.Provider>
	);
};
export const useTeleport = () => {
	const updateList = useContext(TeleportContext);
	return {
		warp(render: VNode) {
			updateList({
				type: "append",
				VNode: render
			});
			return () => {
				updateList({
					type: "remove",
					VNode: render
				});
			};
		}
	};
};
