import PropTypes from "prop-types";
import Button from "../Shared/Button/Button";
import { useState } from "react";
import { DateRange } from "react-date-range";
import { differenceInCalendarDays } from "date-fns";

const RoomReservation = ({ room }) => {
  const [state, setState] = useState([
    {
      startDate: room.from,
      endDate: room.to,
      key: "selection",
    },
  ]);

  const totalPrice = parseInt(
    differenceInCalendarDays(
      new Date(room.to), new Date(room.from)
    ) * room?.price
  )
  console.log(totalPrice);
  return (
    <div className="rounded-xl border-[1px] border-neutral-200 overflow-hidden bg-white">
      <div className="flex items-center gap-1 p-4">
        <div className="text-2xl font-semibold">$ {room?.price}</div>
        <div className="font-light text-neutral-600">/night</div>
      </div>
      <hr />
      <div className="flex justify-center">
        <DateRange
          rangeColors={["#f6536d"]}
          editableDateInputs={true}
          onChange={(item) =>
            setState([
              {
                startDate: room.from,
                endDate: room.to,
                key: "selection",
              },
            ])
          }
          moveRangeOnFirstSelection={false}
          ranges={state}
          // showDateDisplay={false}
        />
      </div>
      <hr />
      <div className="p-4">
        <Button label={"Reserve"} />
      </div>
      <hr />
      <div className="p-4 flex items-center justify-between font-semibold text-lg">
        <div>Total</div>
        <div>${totalPrice}</div>
      </div>
    </div>
  );
};

RoomReservation.propTypes = {
  room: PropTypes.object,
};

export default RoomReservation;
