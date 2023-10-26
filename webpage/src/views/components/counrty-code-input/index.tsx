import { Select } from '@chakra-ui/react';
import { MdArrowDropDown } from 'react-icons/md';
import { COUNTRIES } from '../../../utils/const';

type Props = {
	value: string;
	onChange: (text: string) => void;
};
export default function CountryCodeInput({ value, onChange }: Props) {
	const countries = COUNTRIES;

	return (
		<Select
			icon={<MdArrowDropDown />}
			size={'sm'}
			placeholder='Country Code'
			value={value}
			border={'none'}
			textAlign={'center'}
			focusBorderColor='transparent'
			onFocus={(e) => {
				const options = e.target.options;
				for (const option of options) {
					option.textContent = option.getAttribute('data-original-text');
				}
			}}
			onChange={(e) => {
				const code = e.target.value;
				onChange(code);
				e.target.blur();
				const options = e.target.options;
				const selectedIndex = e.target.selectedIndex;
				const selectedOption = options[selectedIndex];
				selectedOption.textContent = `+${code}`;
			}}
		>
			{Object.keys(countries).map((code, index) => {
				return (
					<option key={index} value={code} data-original-text={`+${code} | ${countries[code]}`}>
						{`+${code}`}
					</option>
				);
			})}
		</Select>
	);
}
