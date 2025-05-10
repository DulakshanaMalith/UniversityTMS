const TimetableError = require('../errors/TimetableError');

// Debug function to validate relationships
const validateRelationships = async (Batch, Module) => {
  const batches = await Batch.find().populate('modules');
  const modules = await Module.find().populate('batches');
  
  const issues = [];
  
  // Check batch-module relationships
  batches.forEach(batch => {
    if (!batch.modules || batch.modules.length === 0) {
      issues.push(`Batch ${batch.batch_name} has no modules`);
    }
    
    batch.modules.forEach(module => {
      if (!module) {
        issues.push(`Batch ${batch.batch_name} has an invalid module reference`);
      }
    });
  });
  
  // Check module-batch relationships
  modules.forEach(module => {
    if (!module.batches || module.batches.length === 0) {
      issues.push(`Module ${module.module_name} is not assigned to any batch`);
    }
    
    if (!module.lecturers || module.lecturers.length === 0) {
      issues.push(`Module ${module.module_name} has no lecturers assigned`);
    }
  });
  
  return issues;
};

// Get available days based on batch type
const getAvailableDays = (batch) => {
  if (!batch || !batch.weekend_or_weekday) {
    console.warn('Batch or weekend_or_weekday not provided, defaulting to weekday');
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  }
  return batch.weekend_or_weekday.toLowerCase() === "weekend" 
    ? ["Saturday", "Sunday"]
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
};

// Calculate sessions needed for a module
const calculateSessions = (module) => {
  if (!module || !module.credit_hours) {
    console.error('Invalid module or credit hours not provided');
    return { totalSessions: 0, regularSessions: 0, hasPartialSession: false, sessionsPerWeek: 0 };
  }

  const hoursPerSession = 2; // 2 hours per session
  const totalSessions = Math.ceil(module.credit_hours / hoursPerSession);
  const regularSessions = Math.floor(module.credit_hours / hoursPerSession);
  const hasPartialSession = module.credit_hours % hoursPerSession !== 0;
  
  return {
    totalSessions,
    regularSessions,
    hasPartialSession,
    sessionsPerWeek: module.is_lab ? 1 : Math.min(2, totalSessions) // Labs once per week, others max twice
  };
};

// Check hall availability with capacity consideration
const isHallSuitable = (hall, groupSize, moduleType) => {
  if (!hall || !groupSize || !moduleType) {
    console.error('Missing parameters in isHallSuitable:', { hall, groupSize, moduleType });
    return false;
  }

  // For labs, check if hall has computer lab facility
  if (moduleType === 'lab' && !hall.facilities?.includes('Computer Lab')) {
    return false;
  }
  
  // Ensure hall capacity is sufficient with some buffer
  const capacityBuffer = 1.1; // 10% buffer
  return hall.capacity >= Math.ceil(groupSize * capacityBuffer);
};

// Calculate lecturer workload score
const calculateLecturerWorkload = (lecturer, existingSlots, proposedSlot) => {
  const dailySlots = new Map();
  let totalSlots = 0;

  // Count existing slots
  existingSlots.forEach(slot => {
    if (slot.lecturer._id.equals(lecturer._id)) {
      const daySlots = dailySlots.get(slot.day) || 0;
      dailySlots.set(slot.day, daySlots + 1);
      totalSlots++;
    }
  });

  // Add proposed slot
  if (proposedSlot) {
    const daySlots = dailySlots.get(proposedSlot.day) || 0;
    dailySlots.set(proposedSlot.day, daySlots + 1);
    totalSlots++;
  }

  // Calculate workload score
  const maxDailySlots = 4;
  const maxWeeklySlots = 15;
  let workloadScore = totalSlots / maxWeeklySlots;

  // Penalize uneven distribution
  dailySlots.forEach(slots => {
    if (slots > maxDailySlots) {
      workloadScore += 0.5; // Heavy penalty for exceeding daily limit
    }
  });

  return workloadScore;
};

// Check time conflicts
const checkTimeConflicts = (proposedSlot, existingSlots) => {
  if (!proposedSlot || !Array.isArray(existingSlots)) {
    console.error('Invalid parameters in checkTimeConflicts');
    return [{ type: 'error', message: 'Invalid parameters provided' }];
  }

  const conflicts = [];
  
  for (const existing of existingSlots) {
    if (existing.day !== proposedSlot.day || existing.timeSlot !== proposedSlot.timeSlot) {
      continue;
    }

    // Check hall conflict
    if (existing.hall._id.toString() === proposedSlot.hall._id.toString()) {
      conflicts.push({
        type: 'hall',
        message: `Hall ${proposedSlot.hall.hall_name} is already booked`
      });
    }

    // Check lecturer conflict
    if (existing.lecturer._id.toString() === proposedSlot.lecturer._id.toString()) {
      const lecturerName = proposedSlot.lecturer.name || 'Unknown';
      conflicts.push({
        type: 'lecturer',
        message: `Lecturer ${lecturerName} is already teaching`
      });
    }

    // Check batch group conflict
    if (existing.batch._id.toString() === proposedSlot.batch._id.toString() && 
        existing.group === proposedSlot.group) {
      conflicts.push({
        type: 'batch',
        message: `Batch ${proposedSlot.batch.batch_name} Group ${proposedSlot.group} already has a class`
      });
    }
  }

  return conflicts;
};

// Get optimal time slot considering various factors
const getOptimalTimeSlot = (availableSlots, module, batch, lecturer, existingSlots) => {
  const slots = [...availableSlots];
  
  // Score each slot based on various factors
  const slotScores = slots.map(slot => {
    let score = 0;
    
    // Prefer morning slots for theory classes
    if (!module.is_lab && (slot.startsWith('08:') || slot.startsWith('10:'))) {
      score += 2;
    }
    
    // Prefer afternoon slots for labs
    if (module.is_lab && (slot.startsWith('13:') || slot.startsWith('15:'))) {
      score += 2;
    }
    
    // Check lecturer's existing schedule
    const lecturerSlots = existingSlots.filter(s => 
      s.lecturer._id.equals(lecturer._id) && s.day === slot.day
    );
    
    // Penalize too many classes in one day
    score -= lecturerSlots.length * 2;
    
    return { slot, score };
  });
  
  // Sort by score and return the best slot
  slotScores.sort((a, b) => b.score - a.score);
  return slotScores[0]?.slot;
};

module.exports = {
  validateRelationships,
  getAvailableDays,
  calculateSessions,
  isHallSuitable,
  calculateLecturerWorkload,
  checkTimeConflicts,
  getOptimalTimeSlot
};