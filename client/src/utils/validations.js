export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(name);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateDepartment = (department) => {
  const departmentRegex = /^[a-zA-Z\s]+$/;
  return departmentRegex.test(department);
};

export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateHallName = (name) => {
  const hallNameRegex = /^[a-zA-Z0-9\s]+$/;
  return hallNameRegex.test(name);
};

export const validateFloor = (floor) => {
  const floorNum = parseInt(floor);
  return !isNaN(floorNum) && floorNum >= 0 && floorNum <= 15;
};

export const validateModuleName = (name) => {
  const moduleNameRegex = /^[a-zA-Z\s]+$/;
  return moduleNameRegex.test(name);
};

export const validateCreditHours = (hours) => {
  const hoursNum = parseInt(hours);
  return !isNaN(hoursNum) && hoursNum > 0 && hoursNum <= 168;
};

export const validateBatchName = (name) => {
  // Only allow letters, numbers, spaces, and hyphens
  const batchNameRegex = /^[a-zA-Z0-9\s-]+$/;
  return batchNameRegex.test(name);
};

export const validateAcademicYear = (year) => {
  const yearNum = parseInt(year);
  return yearNum >= 2000 && yearNum <= 2025;
};

export const validateSemester = (semester) => {
  return semester === 1 || semester === 2;
};

export const validateNumberOfGroups = (count) => {
  const num = parseInt(count);
  return num >= 1 && num <= 20;
}; 