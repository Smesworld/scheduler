import { useEffect, useReducer } from "react";
import axios from "axios"

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";

function reducer(state, action) {
  switch (action.type) {
    case SET_DAY:
      return {
        ...state,
        day: action.value
      }
    case SET_APPLICATION_DATA:
      return {
        ...state,
        days: action.value[0].data,
        appointments: action.value[1].data,
        interviewers: action.value[2].data
      }
    case SET_INTERVIEW:
      return { 
        ...state,
        appointments: action.value
      }
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  function bookInterview(id, interview) {
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
        dispatch({ type: SET_INTERVIEW, value: appointments})
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
        // setState((prev) => ({
        //   ...prev,
        //   appointments
        // }))
        dispatch({ type: SET_INTERVIEW, value: appointments})
      })
  }
  
  // const setDay = day => setState({ ...state, day });
  const setDay = day => dispatch({ type: SET_DAY, value: day })

  useEffect(() => {
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