// utils/validators.ts

/* -------------------------------------------------------
   SHARED TYPES (do NOT remove ANY fields)
-------------------------------------------------------- */

export interface TutorProfileErrors {
  [key: string]: string | undefined;
  name?: string;
  email?: string;
  gender?: string;
  teachingMode?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

export interface StudentProfileErrors {
  [key: string]: string | undefined;
  name?: string;
  email?: string;
  gender?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;       // <-- KEEP for compatibility
}

/* -------------------------------------------------------
   SHARED HELPERS
-------------------------------------------------------- */
const isEmpty = (v: any) =>
  v === undefined || v === null || String(v).trim() === "";

const isValidEmail = (email: string) => /\S+@\S+\.\S+$/.test(email);
const isValidPincode = (pin: string) => /^[0-9]{6}$/.test(pin);
const isValidPhone = (num: string) => /^[0-9]{10}$/.test(num);

/* -------------------------------------------------------
   TUTOR VALIDATOR (UNCHANGED)
-------------------------------------------------------- */

export function validateTutorProfile(data: any): TutorProfileErrors {
  const errors: TutorProfileErrors = {};

  if (isEmpty(data.name)) errors.name = "Full Name is required";

  if (isEmpty(data.email)) errors.email = "Email is required";
  else if (!isValidEmail(data.email)) errors.email = "Enter a valid email";

  if (!isValidPhone(data.phone)) {
    errors.phone = "Mobile number must be exactly 10 digits";
  }

  if (isEmpty(data.gender)) errors.gender = "Gender is required";

  if (isEmpty(data.teachingMode))
    errors.teachingMode = "Teaching mode is required";

  if (isEmpty(data.addressLine1))
    errors.addressLine1 = "Address Line 1 is required";

  if (isEmpty(data.city)) errors.city = "City is required";

  if (isEmpty(data.state)) errors.state = "State is required";

  if (isEmpty(data.pincode)) errors.pincode = "Pincode is required";
  else if (!isValidPincode(data.pincode))
    errors.pincode = "Pincode must be 6 digits";

  return errors;
}

/* -------------------------------------------------------
   STUDENT VALIDATOR (Corrected Mapping)
-------------------------------------------------------- */

export function validateStudentProfileFields(
  data: any
): StudentProfileErrors {
  const errors: StudentProfileErrors = {};

  if (isEmpty(data.name)) errors.name = "Full Name is required";

  if (isEmpty(data.email)) errors.email = "Email is required";
  else if (!isValidEmail(data.email)) errors.email = "Enter a valid email";

  // ----- Phone Mapping (Option B) -----
  const phoneToValidate = data.altPhone || data.phone;
  if (phoneToValidate && !isValidPhone(phoneToValidate)) {
    errors.phone = "Mobile number must be 10 digits";
  }

  if (isEmpty(data.gender)) errors.gender = "Gender is required";
  if (isEmpty(data.addressLine1))
    errors.addressLine1 = "Address Line 1 is required";

  if (isEmpty(data.city)) errors.city = "City is required";
  if (isEmpty(data.state)) errors.state = "State is required";

  if (isEmpty(data.pincode)) errors.pincode = "Pincode is required";
  else if (!isValidPincode(data.pincode))
    errors.pincode = "Pincode must be 6 digits";

  return errors;
}

export default {
  validateTutorProfile,
  validateStudentProfileFields,
};
