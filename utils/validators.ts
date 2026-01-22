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
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  qualification?: string;
  experience?: string;
  subjects?: string;
  classLevels?: string;
  boards?: string;
  exams?: string;
  studentTypes?: string;
  groupSizes?: string;
  hourlyRate?: string;
  monthlyRate?: string;
  availability?: string;
  bio?: string;
  photoUrl?: string;
  resumeUrl?: string;
  demoVideo?: string;
}

export interface StudentProfileErrors {
  [key: string]: string | undefined;
  name?: string;
  email?: string;
  gender?: string;
  genderOther?: string;
  altPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;       // <-- KEEP for compatibility
  learningMode?: string;
  track?: string;
  board?: string;
  boardOther?: string;
  classLevel?: string;
  classLevelOther?: string;
  stream?: string;
  streamOther?: string;
  program?: string;
  programOther?: string;
  discipline?: string;
  disciplineOther?: string;
  yearSem?: string;
  yearSemOther?: string;
  exam?: string;
  examOther?: string;
  targetYear?: string;
  targetYearOther?: string;
  subjects?: string;
  subjectOther?: string;
  tutorGenderPref?: string;
  tutorGenderOther?: string;
  preferredTimes?: string;
  availability?: string;
  goals?: string;
  photoUrl?: string;
}

/* -------------------------------------------------------
   SHARED HELPERS
-------------------------------------------------------- */
const isEmpty = (v: any) =>
  v === undefined || v === null || String(v).trim() === "";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = "Mobile number must be exactly 10 digits";
  }

  if (isEmpty(data.gender)) errors.gender = "Gender is required";

  if (isEmpty(data.teachingMode))
    errors.teachingMode = "Teaching mode is required";

  if (isEmpty(data.addressLine1))
    errors.addressLine1 = "Address Line 1 is required";
  if (isEmpty(data.addressLine2))
    errors.addressLine2 = "Address Line 2 is required";
  if (isEmpty(data.addressLine2))
    errors.addressLine2 = "Address Line 2 is required";

  if (isEmpty(data.city)) errors.city = "City is required";

  if (isEmpty(data.state)) errors.state = "State is required";

  if (isEmpty(data.pincode)) errors.pincode = "Pincode is required";
  else if (!isValidPincode(data.pincode))
    errors.pincode = "Pincode must be 6 digits";

  if (isEmpty(data.qualification))
    errors.qualification = "Qualification is required";
  if (isEmpty(data.experience))
    errors.experience = "Experience is required";
  else if (Number(data.experience) < 0)
    errors.experience = "Experience must be 0 or more";

  if (!Array.isArray(data.subjects) || data.subjects.length === 0)
    errors.subjects = "Select at least one subject";

  if (!Array.isArray(data.classLevels) || data.classLevels.length === 0)
    errors.classLevels = "Select at least one class level";

  if (!Array.isArray(data.boards) || data.boards.length === 0)
    errors.boards = "Select at least one board";

  if (!Array.isArray(data.studentTypes) || data.studentTypes.length === 0)
    errors.studentTypes = "Select at least one student type";

  const groupSizes = Array.isArray(data.groupSizes) ? data.groupSizes : [];
  if (!groupSizes.length && isEmpty(data.groupSize))
    errors.groupSizes = "Select at least one group size";

  if (isEmpty(data.hourlyRate))
    errors.hourlyRate = "Hourly rate is required";
  else if (Number(data.hourlyRate) <= 0)
    errors.hourlyRate = "Hourly rate must be greater than 0";

  if (isEmpty(data.monthlyRate))
    errors.monthlyRate = "Monthly rate is required";
  else if (Number(data.monthlyRate) <= 0)
    errors.monthlyRate = "Monthly rate must be greater than 0";

  if (!Array.isArray(data.availability) || data.availability.length === 0)
    errors.availability = "Availability is required";

  if (isEmpty(data.bio)) errors.bio = "Bio is required";

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
  if (isEmpty(data.altPhone)) {
    errors.altPhone = "Mobile number is required";
  } else if (!isValidPhone(data.altPhone)) {
    errors.altPhone = "Mobile number must be 10 digits";
  }

  if (isEmpty(data.gender)) errors.gender = "Gender is required";
  if (data.gender === "Other" && isEmpty(data.genderOther))
    errors.genderOther = "Please specify gender";
  if (isEmpty(data.addressLine1))
    errors.addressLine1 = "Address Line 1 is required";
  if (isEmpty(data.addressLine2))
    errors.addressLine2 = "Address Line 2 is required";

  if (isEmpty(data.city)) errors.city = "City is required";
  if (isEmpty(data.state)) errors.state = "State is required";

  if (isEmpty(data.pincode)) errors.pincode = "Pincode is required";
  else if (!isValidPincode(data.pincode))
    errors.pincode = "Pincode must be 6 digits";

  if (isEmpty(data.learningMode)) errors.learningMode = "Learning mode is required";
  else if (!["Online", "Offline", "Both"].includes(data.learningMode))
    errors.learningMode = "Learning mode must be Online, Offline, or Both";

  if (!["school", "college", "competitive"].includes(data.track))
    errors.track = "Learning track is required";

  if (data.track === "school") {
    if (isEmpty(data.board)) errors.board = "Board is required";
    if (data.board === "Other" && isEmpty(data.boardOther))
      errors.boardOther = "Please specify board";
    if (isEmpty(data.classLevel)) errors.classLevel = "Class level is required";
    if (data.classLevel === "Other" && isEmpty(data.classLevelOther))
      errors.classLevelOther = "Please specify class";
    if (["Class 11", "Class 12"].includes(data.classLevel) && isEmpty(data.stream))
      errors.stream = "Stream is required for Class 11/12";
    if (data.stream === "Other" && isEmpty(data.streamOther))
      errors.streamOther = "Please specify stream";
  }

  if (data.track === "college") {
    if (isEmpty(data.program)) errors.program = "Program is required";
    if (data.program === "Other" && isEmpty(data.programOther))
      errors.programOther = "Please specify program";
    if (isEmpty(data.discipline)) errors.discipline = "Discipline is required";
    if (data.discipline === "Other" && isEmpty(data.disciplineOther))
      errors.disciplineOther = "Please specify discipline";
    if (isEmpty(data.yearSem)) errors.yearSem = "Year/Semester is required";
    if (data.yearSem === "Other" && isEmpty(data.yearSemOther))
      errors.yearSemOther = "Please specify year/semester";
  }

  if (data.track === "competitive") {
    if (isEmpty(data.exam)) errors.exam = "Exam is required";
    if (data.exam === "Other" && isEmpty(data.examOther))
      errors.examOther = "Please specify exam";
    if (isEmpty(data.targetYear)) errors.targetYear = "Target year is required";
    if (data.targetYear === "Other" && isEmpty(data.targetYearOther))
      errors.targetYearOther = "Please specify target year";
  }

  if (!Array.isArray(data.subjects) || data.subjects.length === 0)
    errors.subjects = "Select at least one subject";

  if (isEmpty(data.tutorGenderPref))
    errors.tutorGenderPref = "Tutor gender preference is required";
  if (data.tutorGenderPref === "Other" && isEmpty(data.tutorGenderOther))
    errors.tutorGenderOther = "Please specify tutor gender";

  if (!Array.isArray(data.preferredTimes) || data.preferredTimes.length === 0)
    errors.preferredTimes = "Preferred time slots are required";

  if (!Array.isArray(data.availability) || data.availability.length === 0)
    errors.availability = "Availability is required";

  if (isEmpty(data.goals)) errors.goals = "Learning goals are required";

  return errors;
}

export default {
  validateTutorProfile,
  validateStudentProfileFields,
};
