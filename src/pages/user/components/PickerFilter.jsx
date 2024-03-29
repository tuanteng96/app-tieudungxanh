import React, { useState } from "react";
import { Sheet } from "framework7-react";
import DatePicker from "react-mobile-datepicker";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Form, Formik } from "formik";
import moment from "moment";
import { IoIosClose } from "react-icons/io";

const dateConfig = {
  // hour: {
  //   format: "hh",
  //   caption: "Giờ",
  //   step: 1,
  // },
  // minute: {
  //   format: "mm",
  //   caption: "Phút",
  //   step: 1,
  // },
  date: {
    caption: "Ngày",
    format: "D",
    step: 1,
  },
  month: {
    caption: "Tháng",
    format: "M",
    step: 1,
  },
  year: {
    caption: "Năm",
    format: "YYYY",
    step: 1,
  },
};

const InputDate = ({ onChange, format, value, name, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="position-relative" onClick={() => setIsOpen(true)}>
        <input
          name={name}
          value={value ? moment(value).format(format) : ""}
          className="form-control"
          type="text"
          placeholder="Chọn từ gian"
          readOnly
        />
        {value && (
          <div
            className="position-absolute top-0 right-0 h-100 d--f ai--c jc--c"
            style={{
              width: "48px",
            }}
            onClick={(event) => {
              event.stopPropagation();
              onChange("");
              setIsOpen(false);
            }}
          >
            <IoIosClose
              style={{
                width: "26px",
                height: "26px",
                color: "#888",
              }}
            />
          </div>
        )}
      </div>
      {createPortal(
        <AnimatePresence exitBeforeEnter>
          {isOpen && (
            <motion.div
              className="position-absolute w-100 h-100 top-0 left-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ display: "none" }}
              transition={{ ease: "linear", duration: 0.4 }}
              style={{
                background: "rgb(0 0 0 / 33%)",
                zIndex: "99999",
              }}
              onClick={() => setIsOpen(false)}
            ></motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      <DatePicker
        theme="ios"
        cancelText="Đóng"
        confirmText="Chọn"
        headerFormat="Ngày DD/MM/YYYY"
        showCaption={true}
        dateConfig={dateConfig}
        isOpen={isOpen}
        onSelect={(val) => {
          onChange(val);
          setIsOpen(false);
        }}
        value={value ? value : new Date()}
        onCancel={() => setIsOpen(false)}
        {...props}
      />
    </>
  );
};

function PickerFilter({ children, onSubmit, initialValues }) {
  const [visible, setVisible] = useState(false);

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  return (
    <>
      {children({
        open: open,
      })}
      <Sheet
        opened={visible}
        className="demo-sheet-swipe-to-step"
        style={{
          height: "auto",
          "--f7-sheet-bg-color": "#fff",
          borderRadius: "25px 25px 0 0",
        }}
        //swipeToClose
        swipeToStep
        backdrop
        onSheetClosed={close}
      >
        <Formik
          initialValues={
            initialValues || {
              To: "",
              From: "",
            }
          }
          onSubmit={(values) => onSubmit(values, close)}
          enableReinitialize={true}
        >
          {(formikProps) => {
            const { values, touched, errors, setFieldValue, handleBlur } =
              formikProps;
            return (
              <Form className="p-15px">
                <div
                  className="text-center"
                  style={{
                    fontSize: "20px",
                    textTransform: "uppercase",
                    fontWeight: "500",
                    padding: "10px 0 15px",
                  }}
                >
                  Bộ lọc
                </div>
                <div className="mb-15px">
                  <div className="mb-5px">Từ ngày</div>
                  <InputDate
                    format="DD/MM/YYYY"
                    name="From"
                    value={values.From}
                    onChange={(val) => {
                      setFieldValue("From", val);
                    }}
                  />
                </div>
                <div className="mb-15px">
                  <div className="mb-5px">Đến ngày</div>
                  <InputDate
                    format="DD/MM/YYYY"
                    name="To"
                    value={values.To}
                    onChange={(val) => {
                      setFieldValue("To", val);
                    }}
                  />
                </div>
                <div>
                  <button type="submit" className="button-color">
                    Thực hiện lọc
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Sheet>
    </>
  );
}

export default PickerFilter;
