export const SET_DAY = "SET_DAY";
export const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
export const SET_INTERVIEW = "SET_INTERVIEW";
export const SET_WEBSOCKET = "SET_WEBSOCKET";

const reducerLookup = {
  SET_WEBSOCKET: (state) => {
    return {
      ...state,
      webSocket: new WebSocket(process.env.REACT_APP_WEBSOCKET_URL)
    };
  },
  SET_DAY: (state, action) => {
    return {
      ...state,
      day: action.value
    };
  },
  SET_APPLICATION_DATA: (state, action) => {
    return {
      ...state,
      days: action.value[0].data,
      appointments: action.value[1].data,
      interviewers: action.value[2].data
    };
  },
  SET_INTERVIEW: (state, action) => {
    // copy current interview for id
    const appointment = {
      ...state.appointments[action.value.id]
    };

    // create shallow copy of days and each day
    const days = [ ...state.days ];
    days.forEach((day, index, array) => {
      const newDay = { ...day };

      // if no interview in this appointment & adding an interview & this appointment is on this day
      if (!appointment.interview && action.value.interview && day.appointments.includes(action.value.id)) {
        newDay.spots -= 1;
      }
      // if an interview in this appointment & removing an interview & this appointment is on this day
      if (appointment.interview && !action.value.interview && day.appointments.includes(action.value.id)) {
        newDay.spots += 1;
      }

      array[index] = newDay;
    });

    // update interview based on action
    appointment.interview = action.value.interview ? { ...action.value.interview } : null

    const appointments = {
      ...state.appointments,
      [action.value.id]: appointment
    };

    return { 
      ...state,
      days: days,
      appointments: appointments
    };
  }
};

export default function reducer(state, action) {
  if (reducerLookup[action.type]) {
    return reducerLookup[action.type](state, action);
  }

  throw new Error(
    `Tried to reduce with unsupported action type: ${action.type}`
  );
};