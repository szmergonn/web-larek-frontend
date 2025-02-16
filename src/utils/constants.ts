const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

const EMAIL_REGEXP =
	/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
const PHONE_REGEXP = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;

const settings = {};

const categories: Record<string, string> = {
	'софт-скил': 'soft',
	'хард-скил': 'hard',
	'кнопка': 'button',
	'дополнительное': 'additional',
	'другое': 'other',
};

export { API_URL, CDN_URL, EMAIL_REGEXP, PHONE_REGEXP, settings, categories };
