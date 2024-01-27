import { Select } from '@chakra-ui/react';
import { MdArrowDropDown } from 'react-icons/md';
import { COUNTRIES } from '../../../config/const';

type Props = {
	value: string;
	onChange: (text: string) => void;
};
export default function CountryCodeInput({ value, onChange }: Props) {
	const countries = COUNTRIES;

	return (
		<Select
			p={0}
			borderLeftRadius={'lg'}
			borderTopLeftRadius={'lg'}
			borderBottomLeftRadius={'lg'}
			width={'100px'}
			icon={<MdArrowDropDown />}
			placeholder='Country Code'
			value={value}
			border={'none'}
			textAlign={'left'}
			focusBorderColor='transparent'
			onChange={(e) => {
				const code = e.target.value;
				onChange(code);
			}}
		>
			{Object.keys(countries).map((code, index) => {
				return (
					<option
						key={index}
						value={code}
						className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
					>
						{`+${code}` || countries[code]}
					</option>
				);
			})}
		</Select>
	);
}
