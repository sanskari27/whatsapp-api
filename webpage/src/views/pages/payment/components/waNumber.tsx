import {
	Box,
	FormControl,
	FormErrorMessage,
	Input,
	InputGroup,
	InputLeftAddon,
	Text,
} from '@chakra-ui/react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { BILLING_PLANS_DETAILS, BILLING_PLANS_TYPE } from '../../../../utils/const';
import CountryCodeInput from '../../../components/country-code-input';
import { validateWhatsappNumbers } from '../validators';

export type WhatsappNumber = { country_code: string; phone_number: string };

export type WaNumberProps = {
	plan_name: BILLING_PLANS_TYPE;
	plan_details: {
		amount: number;
		user_count: number;
	};
	isHidden: boolean;
};

export interface WANumbersRef {
	getData: () => WhatsappNumber[];
	validate: () => boolean;
}

const WaNumber = forwardRef<WANumbersRef, WaNumberProps>(
	({ plan_details, plan_name, isHidden }, ref) => {
		const [whatsapp_numbers, setWhatsappNumbers] = useState<WhatsappNumber[]>([]);
		const [error, setError] = useState('');

		useEffect(() => {
			if (!Object.values(BILLING_PLANS_TYPE).includes(plan_name as unknown as BILLING_PLANS_TYPE)) {
				return;
			}

			const plan_details = BILLING_PLANS_DETAILS[plan_name as BILLING_PLANS_TYPE];
			const dummyData = Array.from({ length: plan_details.user_count }, () => ({
				country_code: '91',
				phone_number: '',
			})) as WhatsappNumber[];
			setWhatsappNumbers(dummyData);
		}, [plan_name]);

		useImperativeHandle(
			ref,
			() => {
				return {
					getData: () => whatsapp_numbers,
					validate: () => {
						const [isValid, errors] = validateWhatsappNumbers(whatsapp_numbers);
						if (!isValid && errors.length > 0) {
							setError(errors);
							return false;
						}
						return true;
					},
				};
			},
			[whatsapp_numbers]
		);

		const updateWhatsappNumber = (index: number, type: keyof WhatsappNumber, value: string) => {
			setWhatsappNumbers((prev) =>
				prev.map((item, arrIndex) => {
					if (index === arrIndex) {
						item[type] = value;
					}
					return { ...item };
				})
			);
		};

		return (
			<FormControl hidden={isHidden} isInvalid={!!error}>
				<Text fontSize={'xl'} fontWeight={'medium'} pt={'1rem'} textAlign={'center'}>
					Device Numbers
				</Text>
				{whatsapp_numbers.map(({ country_code, phone_number }, index) => (
					<Box key={index}>
						<Text>Whatsapp Number {index + 1}</Text>
						<InputGroup pb={'1rem'}>
							<InputLeftAddon
								width={'80px'}
								paddingX={0}
								children={
									<CountryCodeInput
										value={country_code}
										onChange={(text) => updateWhatsappNumber(index, 'country_code', text)}
									/>
								}
							/>
							<Input
								type='tel'
								backgroundColor={'#E8E8E8'}
								placeholder={'eg. 1234567890'}
								value={phone_number}
								onChange={(e) => updateWhatsappNumber(index, 'phone_number', e.target.value)}
							/>
						</InputGroup>
					</Box>
				))}
				<Input
					backgroundColor={'#E8E8E8'}
					defaultValue={plan_details.amount}
					disabled
					isInvalid={false}
				/>
				{error && <FormErrorMessage>{error}</FormErrorMessage>}
			</FormControl>
		);
	}
);

export default WaNumber;
