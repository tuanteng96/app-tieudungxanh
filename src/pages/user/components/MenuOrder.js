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

function MenuOrder({ data, active, onChange }) {
  return (
    <PerfectScrollbar
      options={perfectScrollbarOptions}
      className="list-cate scroll-hidden scroll"
    >
      {data &&
        data.map((item, index) => {
          return (
            <Link
              className={clsx(item.key === active && "active")}
              onClick={() => onChange(item)}
              key={index}
              tabLink={`#${item.key}`}
              tabLinkActive={item.key === active}
            >
              {item.title} ({item.items.length || "0"})
            </Link>
          );
        })}
    </PerfectScrollbar>
  );
}

export default MenuOrder;
