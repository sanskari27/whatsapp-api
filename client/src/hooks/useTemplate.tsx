import { useEffect, useState } from 'react';
import TemplateService from '../services/template.service';

type TemplateName = 'message' | 'poll';

type MessageTemplate = { id: string; name: string; message: string };

type PollTemplate = {
	id: string;
	name: string;
	poll: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	};
};

type TemplateType<T extends TemplateName> = T extends 'message'
	? MessageTemplate
	: T extends 'poll'
	? PollTemplate
	: never;

export default function useTemplate<T extends TemplateName>(type: T) {
	const [isLoading, setLoading] = useState(false);
	const [addingTemplate, setAddingTemplate] = useState(false);
	const [templates, setTemplates] = useState<TemplateType<T>[]>([]);

	useEffect(() => {
		setLoading(true);
		const promise =
			type === 'poll' ? TemplateService.listPollTemplate() : TemplateService.listMessageTemplate();

		promise
			.then((data) => setTemplates(data as TemplateType<T>[]))
			.finally(() => setLoading(false));
	}, [type]);

	function add(data: Omit<TemplateType<T>, 'id'>) {
		setAddingTemplate(true);
		const promise =
			type === 'poll'
				? TemplateService.createPollTemplate(data as Omit<TemplateType<'poll'>, 'id'>)
				: TemplateService.createMessageTemplate(data as Omit<TemplateType<'message'>, 'id'>);

		promise
			.then((res) => {
				if (!res) return;
				setTemplates((prev) => [...prev, res as TemplateType<T>]);
			})
			.finally(() => {
				setAddingTemplate(false);
			});
	}

	const remove = (id: string) => {
		setAddingTemplate(true);
		TemplateService.deleteTemplate(id, type)
			.then((res) => {
				if (!res) return;
				setTemplates((prev) => prev.filter((t) => t.id !== id));
			})
			.finally(() => {
				setAddingTemplate(false);
			});
	};

	const update = (id: string, data: Omit<TemplateType<T>, 'id'>) => {
		setAddingTemplate(true);
		const promise =
			type === 'poll'
				? TemplateService.updatePollTemplate(id, data as Omit<TemplateType<'poll'>, 'id'>)
				: TemplateService.updateMessageTemplate(id, data as Omit<TemplateType<'message'>, 'id'>);
		promise
			.then((res) => {
				if (!res) return;
				setTemplates((prev) => prev.map((t) => (t.id !== id ? t : (res as TemplateType<T>))));
			})
			.finally(() => {
				setAddingTemplate(false);
			});
	};

	return {
		templates,
		isLoading,
		addingTemplate,
		add,
		update,
		remove,
	};
}
