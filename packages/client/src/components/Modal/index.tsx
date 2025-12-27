import { Alert } from "./Alert";
import { Prompt, type PromptField } from "./Prompt";
import { useTeleport } from "./Teleport";

export const useModal = () => {
	const portal = useTeleport();
	return useMemo(
		() => ({
			prompt: function <const T extends PromptField[]>(
				fields: T,
				title?: string
			): Promise<Record<T[number]["key"], string | undefined>> {
				return new Promise((resolve, reject) => {
					const $ = (
						<Prompt
							fields={fields}
							title={title}
							onSubmit={result => {
								resolve(result);
								remove();
							}}
							onCancel={() => {
								reject();
								remove();
							}}
						/>
					);
					const remove = portal.warp($);
				});
			},
			alert(msg: string, timeout = 3000) {
				const $ = <Alert msg={msg} />;
				const remove = portal.warp($);
				setTimeout(() => {
					remove();
				}, timeout);
			}
		}),
		[portal]
	);
};
