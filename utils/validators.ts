// utils/validators.ts

export interface TutorProfileErrors {
  name?: string;
  email?: string;
  gender?: string;
  teachingMode?: string;
  addressLine1?: string;
  // addressLine2 is optional
  city?: string;
  state?: string;
  pincode?: string;
}

export function validateTutorProfile(data: any): TutorProfileErrors {
  const errors: TutorProfileErrors = {};

  // Required fields
  if (!data.name?.trim()) errors.name = "Full Name is required";

  if (!data.email?.trim()) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(data.email))
    errors.email = "Enter a valid email";

  if (!data.gender?.trim()) errors.gender = "Gender is required";

  if (!data.teachingMode?.trim())
    errors.teachingMode = "Teaching mode is required";

  if (!data.addressLine1?.trim())
    errors.addressLine1 = "Address Line 1 is required";

  // addressLine2 optional → no check

  if (!data.city?.trim()) errors.city = "City is required";

  if (!data.state?.trim()) errors.state = "State is required";

  if (!data.pincode?.trim()) errors.pincode = "Pincode is required";
  else if (!/^[0-9]{6}$/.test(data.pincode))
    errors.pincode = "Pincode must be 6 digits";

  return errors;
}
