import { Box, Center, Icon, IconButton, Image } from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';

type QrImageProps = {
	base64?: string;
};

const QRImage = ({ base64 }: QrImageProps) => {
	const handleDownloadQr = () => {
		if (!base64) return;
		const link = document.createElement('a');
		link.href = base64;
		link.download = 'qr.png';
		link.click();
		document.body.removeChild(link);
	};

	return (
		<Box position={'relative'} width={'150px'} height={'150px'} className='group rounded-md'>
			<Image src={base64} width={'150px'} className='rounded-md' />
			<Center
				height={'150px'}
				width={'150px'}
				position={'absolute'}
				left={0}
				top={0}
				backgroundColor={'#00000070'}
				zIndex={10}
				className='!opacity-0 group-hover:!opacity-100 !transition-all rounded-md !duration-500'
			>
				<IconButton
					aria-label=''
					icon={<Icon as={FiDownload} />}
					color={'black'}
					onClick={handleDownloadQr}
				/>
			</Center>
		</Box>
	);
};

export default QRImage;
