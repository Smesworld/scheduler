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