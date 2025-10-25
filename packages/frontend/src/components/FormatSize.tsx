export const FormatSize = ({ size }: { size: number }) => {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let unitIndex = 0;
	let formattedSize = size;

	while (formattedSize >= 1024 && unitIndex < units.length - 1) {
		formattedSize /= 1024;
		unitIndex++;
	}

	return (
		<span>
			{formattedSize.toFixed(1)} {units[unitIndex]}
		</span>
	);
};
