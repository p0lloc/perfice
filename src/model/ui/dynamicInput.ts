export interface InputEntity {
	id: string;
	name: string;
	fields: InputField[];
}

export interface InputField {
	id: string;
	name: string;
	options?: string[];
}

export interface InputAnswer {
	id: string;
	name: string;
	answers: string[];
}
