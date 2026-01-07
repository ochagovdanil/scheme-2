import { useConfirm } from 'primevue';

// Показать PrimeVue вопросительное модальное окно
export default function useConfirmDialog() {
	const confirm = useConfirm();

	return (
		message: string,
		header: string,
		icon: string,
		rejectProps: {
			label: string;
			severity: string;
			outlined: boolean;
		},
		acceptProps: {
			label: string;
			severity: string;
			outlined: boolean;
		},
		accept: () => void,
		reject: () => void
	) => {
		confirm.require({
			message,
			header,
			icon,
			rejectProps,
			acceptProps,
			accept,
			reject
		});
	};
}
