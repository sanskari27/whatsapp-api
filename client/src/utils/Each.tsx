import React from 'react';

export default function Each<T>({
	items,
	render,
}: {
	items: T[];
	render: (element: T, index: number) => React.ReactElement;
}): React.ReactElement {
	return (
		<React.Fragment>
			{items.map((item, index) => (
				<React.Fragment key={index}>{render(item, index)}</React.Fragment>
			))}
		</React.Fragment>
	);
}
