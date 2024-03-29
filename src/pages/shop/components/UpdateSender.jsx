import React, { useEffect, useState } from "react";
import { ListItem, Sheet } from "framework7-react";
import { useQuery } from "react-query";
import userService from "../../../service/user.service";
import { Form, Formik } from "formik";
import clsx from "clsx";
import * as Yup from "yup";

const DistrictSelect = ({ value, setFieldValue, PID }) => {
  let { data: Districts, isLoading } = useQuery({
    queryKey: ["QUAN", PID],
    queryFn: async () => {
      let { data } = await userService.getDistrict(PID?.ID);
      return data?.lst || [];
    },
    enabled: Boolean(PID && PID?.ID > 0),
  });

  return (
    <div className={clsx("position-relative", !value && "no-value")}>
      <ListItem
        key={Districts || value?.ID}
        title="Quận / Huyện"
        smartSelect
        smartSelectParams={{
          openIn: "popup",
          searchbar: true,
          searchbarPlaceholder: "Nhập tên Quận / Huyện",
          popupCloseLinkText: "Đóng",
          searchbarDisableText: "Huỷ",
        }}
      >
        <select
          name="DID"
          placeholder="Quận / Huyện"
          onChange={(val) => {
            let PID = val?.target?.value || "";
            let i =
              Districts && Districts.findIndex((x) => x.ID == Number(PID));
            if (i > -1) setFieldValue("DID", Districts[i]);
            else setFieldValue("DID", "");

            setFieldValue("SubDID", "");
          }}
          value={value?.ID || ""}
        >
          <option value="" disabled>
            Quận / Huyện
          </option>
          {Districts &&
            Districts.map((item, index) => (
              <option value={item.ID} key={index}>
                {item.Title}
              </option>
            ))}
        </select>
      </ListItem>
      <i className="i-r las la-angle-right"></i>
    </div>
  );
};

const WardsSelect = ({ value, setFieldValue, PID, DID }) => {
  let { data: Wards, isLoading } = useQuery({
    queryKey: ["XA", { PID, DID }],
    queryFn: async () => {
      let { data } = await userService.getWards(PID?.ID, DID?.ID);
      return data?.lst || [];
    },
    enabled: Boolean(PID && PID?.ID > 0 && DID && DID?.ID > 0),
  });

  return (
    <div className={clsx("position-relative", !value && "no-value")}>
      <ListItem
        key={Wards || value?.ID}
        title="Phường / Xã"
        smartSelect
        smartSelectParams={{
          openIn: "popup",
          searchbar: true,
          searchbarPlaceholder: "Nhập tên Phường / Xã",
          popupCloseLinkText: "Đóng",
          searchbarDisableText: "Huỷ",
        }}
      >
        <select
          name="SubDID"
          placeholder="Phường / Xã"
          onChange={(val) => {
            let PID = val?.target?.value || "";
            let i = Wards && Wards.findIndex((x) => x.ID == Number(PID));
            if (i > -1) setFieldValue("SubDID", Wards[i]);
            else setFieldValue("SubDID", "");
          }}
          value={value?.ID || ""}
        >
          <option value="" disabled>
            Phường / Xã
          </option>
          {Wards &&
            Wards.map((item, index) => (
              <option value={item.ID} key={index}>
                {item.Title}
              </option>
            ))}
        </select>
      </ListItem>
      <i className="i-r las la-angle-right"></i>
    </div>
  );
};

const sendSchema = Yup.object().shape({
  SenderName: Yup.string().required("Vui lòng nhập họ tên."),
  SenderPhone: Yup.string().required("Vui lòng nhập số điện thoại."),
  SenderAddress: Yup.string().required(
    "Vui lòng nhập Tên đường, Toà nhà, Số nhà."
  ),
  PID: Yup.object().required("Vui lòng chọn Tỉnh / Thành phố."),
  DID: Yup.object().required("Vui lòng chọn Quận / Huyện."),
  SubDID: Yup.object().required("Vui lòng chọn Phường / Xã."),
});

function UpdateSender({ opened, onSheetClosed, initial, onSubmit }) {
  const [initialValues, setInitialValues] = useState({
    SenderAddress: "",
    SenderPhone: "",
    SenderName: "",
    PID: "",
    DID: "",
    SubDID: "",
  });

  useEffect(() => {
    setInitialValues((prevState) => ({ ...prevState, ...initial }));
  }, [opened, initial]);

  let { data: Citys, isLoading } = useQuery({
    queryKey: ["TINH"],
    queryFn: async () => {
      let { data } = await userService.getCitys();
      return data?.lst
        ? data?.lst.map((x) => ({ ID: x.ID, Title: x.Title }))
        : [];
    },
    cacheTime: 0
  });

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validationSchema={sendSchema}
    >
      {(formikProps) => {
        const {
          values,
          touched,
          errors,
          handleChange,
          handleBlur,
          setFieldValue,
          resetForm,
        } = formikProps;

        return (
          <Sheet
            className="sheet-sender"
            style={{
              height: "100%",
              "--f7-sheet-bg-color": "#fff",
              //   borderRadius: "16px 16px 0 0",
            }}
            swipeToClose
            backdrop
            opened={opened}
            onSheetClosed={() => {
              onSheetClosed();
              setTimeout(() => {
                resetForm();
              }, 150);
            }}
          >
            <Form className="h-100 d--f fd--c" style={{ backgroundColor: "#f4f7f9" }}>
              <div
                className="position-relative bg-app"
                style={{
                  padding: "15px 32px",
                  background: "var(--ezs-color)",
                  borderBottom: "solid 2px rgba(255, 255, 255, 0.3)",
                  color: "#fff"
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    textAlign: "center",
                    fontWeight: "500",
                  }}
                >
                  Địa chỉ nhận hàng
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: "18px",
                    top: "14px",
                    fontSize: "30px",
                  }}
                  onClick={onSheetClosed}
                >
                  <i className="las la-times"></i>
                </div>
              </div>
              <div
                className="sender-info"
                style={{
                  flexGrow: "1",
                  overflow: "auto",
                }}
              >
                <div>
                  <label>Liên hệ</label>
                  <div className="form-controls">
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      name="SenderName"
                      value={values.SenderName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.SenderName && touched.SenderName && (
                      <div className="error-bg">{errors.SenderName}</div>
                    )}
                  </div>
                  <div className="form-controls">
                    <input
                      type="text"
                      placeholder="Số điện thoại"
                      name="SenderPhone"
                      value={values.SenderPhone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.SenderPhone && touched.SenderPhone && (
                      <div className="error-bg">{errors.SenderPhone}</div>
                    )}
                  </div>
                  <label>Địa chỉ</label>
                  <div
                    className={clsx(
                      "position-relative",
                      !values.PID && "no-value"
                    )}
                  >
                    <ListItem
                      key={Citys || values.PID?.ID}
                      title="Tỉnh / Thành phố"
                      smartSelect
                      smartSelectParams={{
                        openIn: "popup",
                        searchbar: true,
                        searchbarPlaceholder: "Nhập tên tỉnh / thành phố",
                        popupCloseLinkText: "Đóng",
                        searchbarDisableText: "Huỷ",
                        //closeOnSelect: true,
                      }}
                    >
                      <select
                        name="PID"
                        placeholder="Tỉnh / Thành phố"
                        onChange={(val) => {
                          let PID = val?.target?.value || "";
                          let i =
                            Citys &&
                            Citys.findIndex((x) => x.ID == Number(PID));
                          if (i > -1) setFieldValue("PID", Citys[i]);
                          else setFieldValue("PID", "");

                          setFieldValue("DID", "");
                          setFieldValue("SubDID", "");
                        }}
                        value={values.PID?.ID || ""}
                      >
                        <option value="" disabled>
                          Tỉnh / Thành phố
                        </option>
                        {Citys &&
                          Citys.map((item, index) => (
                            <option value={item.ID} key={index}>
                              {item.Title}
                            </option>
                          ))}
                      </select>
                    </ListItem>
                    <i className="i-r las la-angle-right"></i>
                  </div>
                  {errors.PID && touched.PID && (
                    <div className="error-bg">{errors.PID}</div>
                  )}
                  <DistrictSelect
                    setFieldValue={setFieldValue}
                    value={values.DID}
                    PID={values?.PID}
                  />
                  {errors.DID && touched.DID && (
                    <div className="error-bg">{errors.DID}</div>
                  )}
                  <WardsSelect
                    setFieldValue={setFieldValue}
                    value={values.SubDID}
                    PID={values?.PID}
                    DID={values?.DID}
                  />
                  {errors.SubDID && touched.SubDID && (
                    <div className="error-bg">{errors.SubDID}</div>
                  )}
                  <div className="form-controls">
                    <textarea
                      type="text"
                      placeholder="Tên đường, Toà nhà, Số nhà"
                      name="SenderAddress"
                      value={values.SenderAddress}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.SenderAddress && touched.SenderAddress && (
                      <div className="error-bg">{errors.SenderAddress}</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-12px sender-info">
                <button type="submit" className="btn-login btn-me">
                  <span>Cập nhập</span>
                </button>
              </div>
            </Form>
          </Sheet>
        );
      }}
    </Formik>
  );
}

export default UpdateSender;
