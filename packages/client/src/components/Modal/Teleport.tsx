import { createContext, type FunctionComponent, type VNode } from "preact";
import {
	useContext,
	useState,
	type Dispatch,
	type StateUpdater
} from "preact/hooks";

const TeleportContext = createContext<
	[VNode[], Dispatch<StateUpdater<VNode[]>>]
>(null as never);

export const TeleportWrapper: FunctionComponent = ({ children }) => {
	const list = useState<VNode[]>([]);
	return (
		<TeleportContext.Provider value={list}>
			{children}
			{list[0].map(item => (
				<>{item}</>
			))}
		</TeleportContext.Provider>
	);
};
export const useTeleport = () => {
	const [list, setList] = useContext(TeleportContext);
	return {
		warp(render: VNode) {
			setList([...list, render]);
			return () => {
				setList(list.filter(item => item !== render));
			};
		}
	};
};
