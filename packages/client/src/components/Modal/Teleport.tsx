import { createContext, type FunctionComponent, type VNode } from "preact";
import { useContext, useReducer, type Dispatch } from "preact/hooks";

const TeleportContext = createContext<
	Dispatch<{
		type: string;
		VNode: VNode;
	}>
>(null as never);

export const TeleportWrapper: FunctionComponent = ({ children }) => {
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
