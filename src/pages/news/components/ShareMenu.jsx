import clsx from "clsx";
import { Link } from "framework7-react";
import React from "react";
import PerfectScrollbar from "react-perfect-scrollbar";

const perfectScrollbarOptions = {
  wheelSpeed: 5,
  wheelPropagation: false,
  suppressScrollY: true,
  swipeEasing: false,
};

function ShareMenu({ data, active, onChange }) {
  return (
    <PerfectScrollbar
      options={perfectScrollbarOptions}
      className="list-cate scroll-hidden scroll"
    >
      {data &&
        data.map((item, index) => {
          return (
            <Link
              className={clsx(item.id === active?.id && "active")}
              onClick={() => onChange(item)}
              key={index}
            >
              {item.text}
            </Link>
          );
        })}
    </PerfectScrollbar>
  );
}

export default ShareMenu;
