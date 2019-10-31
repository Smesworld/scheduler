import { useEffect, useReducer } from "react";
import axios from "axios"

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";

const reducerLookup = {
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
    if (action.value.newInterview) {
      state.days.forEach((day) => {
        if (day.appointments.includes(action.value.id)) {
          day.spots -= 1;
        }
      });
    } 
    
    if (action.value.deleteInterview) {
      state.days.forEach((day) => {
        if (day.appointments.includes(action.value.id)) {
          day.spots += 1;
        }
      }); 
    }

    return { 
      ...state,
      appointments: action.value.appointments
    }
  }
}

// const buildAppointment = (state, id, interview) => {


//   return id;
// }

function reducer(state, action) {
  console.log("REducer called with:", action.type)
  return reducerLookup[action.type](state, action);
}

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  let webSocket;

  function bookInterview(id, interview) {
    const newInterview = state.appointments[id].interview ? false : true;

    const appointment = {
      ...state.appointments[id],
      interview: { ...interview }
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment
    };

    return axios.put(`http://localhost:8001/api/appointments/${id}`, appointment)
    .then(() => {
      dispatch({ type: SET_INTERVIEW, value: {appointments, id, newInterview}})
    })

  }

  function cancelInterview(id) {
    const appointment = {
      ...state.appointments[id],
      interview: null
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment
    };
    
    return axios.delete(`http://localhost:8001/api/appointments/${id}`, appointment)
      .then(() => {
        dispatch({ type: SET_INTERVIEW, value: {appointments, id, deleteInterview: true}})
      })
  }
  
  const setDay = day => dispatch({ type: SET_DAY, value: day })

  useEffect(() => {
    webSocket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    Promise.all([
      Promise.resolve(axios.get(`http://localhost:8001/api/days`)),
      Promise.resolve(axios.get(`http://localhost:8001/api/appointments`)),
      Promise.resolve(axios.get(`http://localhost:8001/api/interviewers`))
    ])
      .then((all) => {
        dispatch({ type: SET_APPLICATION_DATA, value: all})
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  return { state, setDay, bookInterview, cancelInterview };
}