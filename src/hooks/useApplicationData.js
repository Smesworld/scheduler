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
        const newInterview = state.appointments[data.id].interview ? false : true;
        const deleteInterview = data.interview ? false : true;
  
        const appointment = {
          ...state.appointments[data.id],
          interview: data.interview ? { ...data.interview } : null
        };
    
        const appointments = {
          ...state.appointments,
          [data.id]: appointment
        };
  
        dispatch({ type: data.type, value: {appointments, id: data.id, newInterview, deleteInterview}});
      }
    }
  }

  useEffect(() => {
    dispatch({ type: SET_WEBSOCKET })

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
    
    return axios.delete(`http://localhost:8001/api/appointments/${id}`, appointment)
      .then(() => {
        // dispatch({ type: SET_INTERVIEW, value: {appointments, id, deleteInterview: true}})
      })
  }
  
  const setDay = day => dispatch({ type: SET_DAY, value: day })



  return { state, setDay, bookInterview, cancelInterview };
}