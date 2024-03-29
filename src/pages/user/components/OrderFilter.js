import clsx from "clsx";
import { Form, Formik } from "formik";
import { Sheet } from "framework7-react";
import React, { useEffect, useState } from "react";

function OrderFilter({ opened, onHide, van_chuyen, onSubmit, filters }) {
  const [initialValues, setInitialValues] = useState({
    OrderID: "",
    Desc: "",
  });

  //   useEffect(() => {
  //     if(opened) {
  //         setInitialValues(filters);
  //     }
  //   }, [opened]);

  return (
    <Sheet
      opened={opened}
      onSheetClosed={onHide}
      backdrop
      className="sheet-filter-order"
    >
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {(formikProps) => {
          const { values, setFieldValue, errors, touched, handleChange } =
            formikProps;

          return (
            <Form>
              <div className="sheet-top">
                <div className="clear" onClick={() => formikProps.resetForm()}>
                  Xoá
                </div>
                <div className="title">Lọc đơn hàng</div>
                <div className="close" onClick={onHide}>
                  <i className="las la-times"></i>
                </div>
              </div>
              <div
                className="px-12px mb-12px"
                style={{
                  fontSize: "15px",
                }}
              >
                <div className="order-form">
                  <div className="order-form-title">Mã đơn hàng</div>
                  <div className="order-form-input position-relative">
                    <input
                      type="text"
                      placeholder="Nhập mã đơn hàng"
                      name="OrderID"
                      value={values.OrderID}
                      onChange={handleChange}
                    />
                    {values.OrderID && (
                      <div
                        className="clear-value top-0 right-0 h-100 d--f jc--c ai--c"
                        onClick={() => {
                          setFieldValue("OrderID", "", false);
                        }}
                        style={{
                          position: "absolute",
                          fontSize: "22px",
                          width: "45px",
                        }}
                      >
                        <i className="las la-times"></i>
                      </div>
                    )}
                  </div>
                </div>
                <div className="order-form">
                  <div className="order-form-title">Vận chuyển</div>
                  <div className="list-vc">
                    {van_chuyen &&
                      van_chuyen.map((x, i) => (
                        <div
                          className={clsx(
                            "list-vc-item",
                            x === values.Desc && "active"
                          )}
                          key={i}
                          onClick={() => {
                            if (x === values.Desc) {
                              setFieldValue("Desc", "");
                            } else {
                              setFieldValue("Desc", x);
                            }
                          }}
                        >
                          {x}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div className="p-12px">
                <button
                  className="btn-login btn-me"
                  type="submit"
                  style={{
                    borderRadius: "30px",
                    fontSize: "16px",
                  }}
                >
                  Áp dụng
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Sheet>
  );
}

OrderFilter.propTypes = {};

export default OrderFilter;
