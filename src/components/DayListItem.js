import React from "react";

import classNames from 'classnames';

import "components/DayListItem.scss";

const formatSpots = (spots) => {
  let spotString;
  if (spots > 1) {
    spotString = `${spots} spots remaining`;
  } else if (spots === 1) {
    spotString = `${spots} spot remaining`;
  } else {
    spotString = `no spots remaining`
  }

  return spotString;
}



export default function DayListItem(props) {
  const dayClass = classNames( "day-list__item", {
    "day-list__item--selected" : props.selected,
    "day-list__item--full" : props.spots === 0
  });

  return (
    <li className={dayClass} onClick={() => props.setDay(props.name)}>
      <h2 className="text--regular">{props.name}</h2> 
      <h3 className="text--light">{formatSpots(props.spots)}</h3>
    </li>
  );
}