import React, { useEffect } from "react";

import "components/Appointment/styles.scss";
import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";
import Form from "./Form";
import Status from "./Status";
import Confirm from "./Confirm";
import Error from "./Error";
import useVisualMode from "hooks/useVisualMode";

const EMPTY = "EMPTY";
const SHOW = "SHOW";
const CREATE = "CREATE";
const EDIT = "EDIT";
const SAVING = "SAVING";
const DELETING = "DELETING";
const CONFIRM = "CONFIRM";

const ERROR_SAVE = "ERROR_SAVE";
const ERROR_DELETE = "ERROR_DELETE";

export default function Appointment(props) {
  const { mode, transition, back } = useVisualMode(
    props.interview ? SHOW : EMPTY);

  const save = (name, interviewer) => {
    const interview = {
      student: name,
      interviewer
    };

    transition(SAVING);

    props.bookInterview(props.id, interview)
      .then(() => transition(SHOW, true))
      .catch((error) => {
        transition(ERROR_SAVE, true);
      });
  };

  const remove = () => {
    transition(CONFIRM);
  };
  
  const confirm = () => {
    transition(DELETING, true);
    props.cancelInterview(props.id)
      .then(() => transition(EMPTY, true))
      .catch((error) => {
        transition(ERROR_DELETE, true);
      });
  };
  
  const cancel = () => {
    back();
  };

  useEffect(() => {
    if (mode === EMPTY && props.interview) {
      transition(SHOW);
    }

    if (mode === SHOW && !props.interview) {
      transition(EMPTY);
    }
  }, [props.interview, transition, mode]);

  return (<article className="appointment" data-testid="appointment">
      <Header time={props.time} />
      {mode === EMPTY && <Empty onAdd={() => transition(CREATE)} />}
      {mode === SHOW && props.interview && (
        <Show 
          student={props.interview.student}
          interviewer={props.interview.interviewer.name}
          onEdit={() => transition(EDIT)}
          onDelete={remove}
        /> 
      )}
      {mode === CREATE && (
        <Form
          interviewers={props.interviewers}
          onSave={save}
          onCancel={cancel}
        />
      )}
      {mode === EDIT && (
        <Form
          name={props.interview.student}
          interviewer={props.interview.interviewer.id}
          interviewers={props.interviewers}
          onSave={save}
          onCancel={cancel}
        />
      )}
      {mode === SAVING && <Status message="Saving" />}
      {mode === DELETING && <Status message="Deleting" />}
      {mode === CONFIRM && (
        <Confirm
          message="Are you sure you would like to delete?"
          onCancel={cancel}
          onConfirm={confirm}
        />
      )}
      {mode === ERROR_SAVE && (
        <Error 
          message={"Error saving appointment."}
          onClose={cancel}
        />
      )}
      {mode === ERROR_DELETE && (
        <Error
          message="Error deleting appointment."
          onClose={cancel}
        />
      )}
    </article>);
};