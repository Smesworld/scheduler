import { useEffect, useReducer } from "react";
import axios from "axios"

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";
const SET_WEBSOCKET = "SET_WEBSOCKET";

const reducerLookup = {
  SET_WEBSOCKET: (state) => {
    return {
      ...state,
      webSocket: new WebSocket(process.env.REACT_APP_WEBSOCKET_URL)
    }
  },
  SET_DAY: (state, action) => {
    return {
      ...state,
      day: action.value
    }
  },
  SET_APPLICATION_DATA: (state, action) => {
    return {
      ...state,
      days: action.value[0].data,
      appointments: action.value[1].data,
      interviewers: action.value[2].data
    }
  },
  SET_INTERVIEW: (state, action) => {
    const appointment = {
      ...state.appointments[action.value.id]
    };
    const days = [ ...state.days ];

    if (!appointment.interview && action.value.interview) {
      days.forEach((day, index, array) => {
        const newDay = { ...day };
        if (day.appointments.includes(action.value.id)) {
          newDay.spots -= 1;
        }

        array[index] = newDay;
      });
    }

    if (appointment.interview && !action.value.interview) {
      days.forEach((day, index, array) => {
        const newDay = { ...day };
        if (day.appointments.includes(action.value.id)) {
          newDay.spots += 1;
        }

        array[index] = newDay;
      }); 
    }

    appointment.interview = action.value.interview ? { ...action.value.interview } : null

    const appointments = {
      ...state.appointments,
      [action.value.id]: appointment
    };

    return { 
      ...state,
      days: days,
      appointments: appointments
    }
  }
}

function reducer(state, action) {
  return reducerLookup[action.type](state, action);
}

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
    webSocket: null
  });

  if (state.webSocket) {
    state.webSocket.onopen = function (event) {
      state.webSocket.send("ping");
    }
    state.webSocket.onmessage = function (event) {
      const data = JSON.parse(event.data);
  
      if (data.type) {    
        dispatch({ type: data.type, value: {interview: data.interview, id: data.id}});
      }
    }
  }

  useEffect(() => {
    dispatch({ type: SET_WEBSOCKET })

    Promise.all([
      axios.get(`/api/days`),
      axios.get(`/api/appointments`),
      axios.get(`/api/interviewers`)
    ])
      .then((all) => {
        dispatch({ type: SET_APPLICATION_DATA, value: all})
      })
      .catch((error) => {
        console.log("Bad things", error);
      });

  }, []);


  function bookInterview(id, interview) {
    const newInterview = state.appointments[id].interview ? false : true;

    const appointment = {
      ...state.appointments[id],
      interview: { ...interview }
    };

    return axios.put(`/api/appointments/${id}`, appointment)
    .then(() => {
      dispatch({ type: SET_INTERVIEW, value: {interview, id, newInterview}})
    })

  }

  function cancelInterview(id) {
    const appointment = {
      ...state.appointments[id],
      interview: null
    };
    
    return axios.delete(`/api/appointments/${id}`, appointment)
      .then(() => {
        dispatch({ type: SET_INTERVIEW, value: {interview: null, id, newInterview: false, deleteInterview: true}})
      })
  }
  
  const setDay = day => dispatch({ type: SET_DAY, value: day })



  return { state, setDay, bookInterview, cancelInterview };
}