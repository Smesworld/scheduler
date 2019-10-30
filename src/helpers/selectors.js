export function getAppointmentsForDay(state, day) {
  let stateDay;
  let dayAppointments;

  if (state.days.length === 0) {
    return [];
  }
  stateDay = state.days.find(stateDay => stateDay.name === day);

  if (!stateDay) {
    return [];
  }

  dayAppointments = stateDay.appointments;
  dayAppointments = dayAppointments.map(appointment => state.appointments[appointment]);

  return dayAppointments;
}

export function getInterview(state, interview) {
  if (!interview) {
    return null;
  }
  const fullInterview = {...interview}; // Copy of interview so we dont change it!

  fullInterview.interviewer = state.interviewers[interview.interviewer];

  return fullInterview;
}

export function getInterviewersForDay(state, day) {
  let stateDay;
  let dayInterviewers;

  if (state.days.length === 0) {
    return [];
  }
  stateDay = state.days.find(stateDay => stateDay.name === day);

  if (!stateDay) {
    return [];
  }

  dayInterviewers = stateDay.interviewers;
  dayInterviewers = dayInterviewers.map(interviewer => state.interviewers[interviewer]);

  return dayInterviewers;
}