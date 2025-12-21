import type { FunctionalComponent, VNode } from "preact";
import type { Dispatch, StateUpdater } from "preact/hooks";

const TeleportContext = createContext<Dispatch<StateUpdater<VNode[]>>>(
	null as never
);

export const TeleportWrapper: FunctionalComponent = ({ children }) => {
	const [list, updateList] = useState<VNode[]>([]);
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
			updateList(prev => [...prev, render]);
			return () => {
				updateList(prev => prev.filter(item => item !== render));
			};
		}
	};
};
