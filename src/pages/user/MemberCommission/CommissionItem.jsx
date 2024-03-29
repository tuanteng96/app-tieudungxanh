import React, { useEffect, useState } from "react";
import {
  checkAvt,
  formatPriceVietnamese,
  groupbyTIME,
} from "../../../constants/format";
import { AnimatePresence, motion } from "framer-motion/dist/framer-motion";
import { Sheet } from "framework7-react";
import userService from "../../../service/user.service";
import { createPortal } from "react-dom";
import moment from "moment";

function CommissionItem({ data, level }) {
  const [isOpen, setIsOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [List, setList] = useState([]);

  useEffect(() => {
    if (opened) {
      getListOrder();
    }
  }, [opened]);

  const getListOrder = () => {
    setLoading(true);
    const memberPost = {
      MemberID: data?.Member?.ID,
    };
    userService
      .getForder(memberPost)
      .then(({ data }) => {
        setList(
          groupbyTIME(
            data?.Lst
              ? data?.Lst.map((x) => ({
                  ...x,
                  CreateDate: x.Order.CreateDate,
                }))
              : [],
            "CreateDate"
          ).reverse()
        );
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  let ChildrenCount = window?.GlobalConfig?.APP?.ChildrenCount || 1000;

  return (
    <div className="border-bottom d--f p-15px">
      <div className="w-50px d--f jc--c ai--c" onClick={() => setOpened(true)}>
        <img className="rounded-circle" src={checkAvt("null.gif")} />
      </div>
      <div className="f--1 px-15px" onClick={() => setOpened(true)}>
        <div className="fw-600">
          {data?.Member?.ID} - {data?.Member?.FullName}
          {!data?.Member?.Donhang_SL && (
            <span className="pl-2px text-danger"> - Chưa kích hoạt</span>
          )}
        </div>
        <div className="text-muted2">{data?.Member?.MobilePhone}</div>
        <div className="text-primary">
          Đơn Hàng (SL {data?.Member?.Donhang_SL})
          <span className="px-3px">
            : {formatPriceVietnamese(data?.Member?.Donhang_TongTien)}
          </span>
        </div>
        <div className="text-primary">
          Hoa hồng :
          <span className="pl-3px">
            {formatPriceVietnamese(data?.Member?.Vi_Tong)}
          </span>
        </div>
      </div>
      {level < ChildrenCount && data.FSubs && data.FSubs.length > 0 && (
        <div
          className="w-45px text-right d--f jc--e ai--c"
          onClick={() => setIsOpen(true)}
        >
          <i className="las la-angle-right"></i>
        </div>
      )}

      {createPortal(
        <AnimatePresence exitBeforeEnter>
          {isOpen && (
            <motion.div
              className="position-absolute w-100 h-100 top-0 left-0 bg-white d--f fd--c"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            >
              <div
                className="position-relative"
                style={{ background: "#f1f1f1", padding: "15px" }}
              >
                <div
                  className="position-absolute w-45px h-100 top-0 left-0 d--f ai--c jc--c"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="las la-angle-left"></i>
                </div>
                <div className="text-center fw-600 px-30px">
                  <span className="pr-5px">(F{level + 1})</span>
                  {data?.Member?.FullName} ({data?.Member?.ID})
                  {data.FSubs && data.FSubs.length > 0 && (
                    <span className="pl-2px">
                      - {data.FSubs.length} thành viên
                    </span>
                  )}
                </div>
              </div>
              <div className="fg--1 overflow-auto">
                {data.FSubs &&
                  data.FSubs.map((item, index) => (
                    <CommissionItem key={index} data={item} level={level + 1} />
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.getElementById("commission")
      )}

      <Sheet
        opened={opened}
        className="demo-sheet-swipe-to-step"
        style={{
          height:
            "calc(100% - calc(var(--f7-navbar-height) + var(--f7-safe-area-top)))",
          "--f7-sheet-bg-color": "#fff",
        }}
        onSheetClosed={() => setOpened(false)}
        backdrop
      >
        <div className="d--f fd--c h-100">
          <div className="p-15px border-bottom">
            <div className="fw-600">
            {data?.Member?.ID} - {data?.Member?.FullName} - {data?.Member?.MobilePhone}
            </div>
            <div className="text-primary">
              Đơn Hàng (SL {data?.Member?.Donhang_SL} )
              <span className="px-3px">
                : {formatPriceVietnamese(data?.Member?.Donhang_TongTien)}
              </span>
              <span className="px-3px">-</span>
              Hoa Hồng : {formatPriceVietnamese(data?.Member?.Vi_Tong)}
            </div>
          </div>
          <div className="fg--1 overflow-auto">
            {loading && <div className="p-15px">Đang tải ...</div>}
            {!loading && (
              <>
                {List &&
                  List.map((item, index) => (
                    <div className="p-15px border-bottom" key={index}>
                      <div className="fw-600">
                        Đơn hàng
                        <span className="text-danger pl-3px">
                          #{item.Order.ID}
                        </span>
                        <span className="pl-3px text-muted fw-400">
                          (
                          {moment(item.Order.CreateDate).format(
                            "HH:mm DD-MM-YYYY"
                          )}
                          )
                        </span>
                      </div>
                      {item.Items &&
                        item.Items.map((order, idx) => (
                          <div className="d--f jc--sb mt-8px" key={idx}>
                            <div>
                              <div>{order?.ProdTitle}</div>
                              <div>{formatPriceVietnamese(order?.Price)}</div>
                            </div>
                            <div className="text-right">
                              <div>x{order?.Qty}</div>
                              <div>{formatPriceVietnamese(order?.ToPay)}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </Sheet>
    </div>
  );
}

export default CommissionItem;
