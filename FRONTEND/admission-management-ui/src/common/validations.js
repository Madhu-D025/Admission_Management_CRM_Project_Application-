const NAME_REGEX = /^[a-zA-Z]*(([',. -][a-zA-Z])?[a-zA-Z]*)*$/;
const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const CONTACT_REGEX = /^(\[\-\s]?)?[0]?(91)?[789]\d{9}$/;
const NUMBER_REGEX = /^[0-9]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{9,}$/;
const NUMBER_REGEX1 = /^\d*\.?\d*$/;

export const isValidName = (name) => {
    return NAME_REGEX.test(String(name));
}

export const isValidEmail = (email) => {
    return EMAIL_REGEX.test(String(email));
}

export const isValidContact = (contact) => {
    return CONTACT_REGEX.test(String(contact));
}

export const isValidNumber = (value) => {
    return NUMBER_REGEX.test(String(value)); 
}

export const isValidPassword = (value) => {
    return passwordRegex.test(String(value)); 
}

export const IsValidNUmberDec = (value) => {
    return NUMBER_REGEX1.test(String(value)); 
}


