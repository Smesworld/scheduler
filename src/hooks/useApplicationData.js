import { useEffect, useReducer } from "react";
import axios from "axios";

import reducer, { SET_WEBSOCKET, SET_DAY, SET_APPLICATION_DATA, SET_INTERVIEW} from "reducers/application";

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
    webSocket: null
  });

  if (state.webSocket) {
    state.webSocket.onopen = () => {
      state.webSocket.send("ping");
    }
    state.webSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
  
      if (data.type) {    
        dispatch({ type: data.type, value: {interview: data.interview, id: data.id}});
      }
    }
  }

  useEffect(() => {
    dispatch({ type: SET_WEBSOCKET });

    Promise.all([
      axios.get(`/api/days`),
      axios.get(`/api/appointments`),
      axios.get(`/api/interviewers`)
    ])
      .then((all) => {
        dispatch({ type: SET_APPLICATION_DATA, value: all})
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);


  const bookInterview = (id, interview) => {
    const newInterview = state.appointments[id].interview ? false : true;

    const appointment = {
      ...state.appointments[id],
      interview: { ...interview }
    };

    return axios.put(`/api/appointments/${id}`, appointment)
    .then(() => {
      dispatch({ type: SET_INTERVIEW, value: {interview, id, newInterview}});
    });

  };

  const cancelInterview = (id) => {
    const appointment = {
      ...state.appointments[id],
      interview: null
    };
    
    return axios.delete(`/api/appointments/${id}`, appointment)
      .then(() => {
        dispatch({ type: SET_INTERVIEW, value: {interview: null, id, newInterview: false, deleteInterview: true}});
      });
  };
  
  const setDay = day => dispatch({ type: SET_DAY, value: day });



  return { state, setDay, bookInterview, cancelInterview };
};