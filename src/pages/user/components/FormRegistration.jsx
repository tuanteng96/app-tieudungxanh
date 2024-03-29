import React, { useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import NumberFormat from "react-number-format";
import {
  getStockIDStorage,
  setStockIDStorage,
  setStockNameStorage,
  setUserLoginStorage,
  setUserStorage,
} from "../../../constants/user";
import clsx from "clsx";
import { useMutation, useQuery } from "react-query";
import UserService from "../../../service/user.service";
import { SEND_TOKEN_FIREBASE } from "../../../constants/prom21";
import { setSubscribe } from "../../../constants/subscribe";
import { toast } from "react-toastify";
import PickerVerify from "./PickerVerify";
import DeviceHelpers from "../../../constants/DeviceHelpers";
import Select from "react-select";
import { Sheet } from "framework7-react";
import NewsDataService from "../../../service/news.service";
import { SERVER_APP } from "../../../constants/config";

const phoneRegExp = /((09|03|07|08|05)+([0-9]{8})\b)/g;

const fixedContentDomain = (content) => {
  if (!content) return "";
  return content.replace(/src=\"\//g, 'src="' + SERVER_APP + "/");
};

const regSchema = Yup.object().shape({
  fullname: Yup.string()
    .min(4, "Họ tên phải có ít nhất 4 kí tự.")
    .required("Vui lòng nhập họ tên."),
  password: Yup.string()
    .min(4, "Mật khẩu phải có ít nhất 4 kí tự.")
    .matches(
      /^(?=.*[a-z])(?=.*[0-9])(?=.{6,})/,
      "Mật khẩu phải gồm đầy đủ số & chữ."
    )
    .required("Vui lòng nhập mật khẩu."),
  repassword: Yup.string().oneOf(
    [Yup.ref("password"), null],
    "Mật khẩu không trùng khớp."
  ),
  phone: Yup.string()
    .required("Vui lòng nhập số điện thoại.")
    .matches(phoneRegExp, "Số điện thoại không hợp lệ."),
  FParentID: Yup.string().required("Vui lòng nhập mã giới thiệu."),
});

function FormRegistration({ f7, f7router, openSelectStock }) {
  const [opened, setOpened] = useState(false);
  const [initialValues] = useState({
    fullname: "",
    password: "",
    repassword: "",
    phone: "",
    address: "",
    birth: "",
    gender: "-1",
    FParentID: "",
    isTerms: true,
  });
  const [isShowPwd, setIsShowPwd] = useState(false);
  const [isShowRePwd, setIsShowRePwd] = useState(false);

  let { data, isLoading } = useQuery({
    queryKey: ["Terms-id"],
    queryFn: async () => {
      let { data } = await NewsDataService.getDetailNew("1525");
      return data?.data && data?.data.length > 0 ? data?.data[0] : null;
    },
  });

  const loginMutation = useMutation({
    mutationFn: (body) =>
      UserService.login(body.username, body.password, body.deviceid),
  });

  const sendOTPMutation = useMutation({
    mutationFn: (body) => UserService.sendStringee(body),
  });

  const firebaseMutation = useMutation({
    mutationFn: (body) => UserService.authSendTokenFirebase(body),
  });

  const existPhoneMutation = useMutation({
    mutationFn: async (body) => {
      let { data } = await UserService.existPhone(body.phone);
      return data?.data;
    },
  });

  const regMutation = useMutation({
    mutationFn: (body) =>
      UserService.register({
        fullname: body.fullname,
        password: body.password,
        phone: body.phone,
        stock: body.stockid,
        address: body.address,
        gender: body.gender ? body.gender?.value : "",
        FParentID: body.FParentID,
      }),
  });

  const onSubmit = (values, { open, ...formikProps }) => {
    const CrStocks = getStockIDStorage();
    if (!CrStocks) {
      openSelectStock();
    } else {
      if (window?.GlobalConfig?.SMSOTP) {
        f7.dialog.preloader("Đang gửi OTP ...");
        existPhoneMutation.mutate(
          { phone: values.phone },
          {
            onSettled: (data) => {
              if (!data || data.length === 0) {
                sendOTPMutation.mutate(
                  { phone: values.phone },
                  {
                    onSettled: ({ data }) => {
                      if (data.ID) {
                        f7.dialog.close();
                        new Promise((resolve, reject) => {
                          open({ Phone: values.phone, resolve });
                        }).then((result) => {
                          f7.preloader.show();
                          regMutation.mutate(
                            { ...values, stockid: CrStocks },
                            {
                              onSettled: ({ data }) => {
                                if (data.errors) {
                                  toast.error(data.error, {
                                    position: toast.POSITION.TOP_LEFT,
                                    autoClose: 3000,
                                  });
                                  f7.preloader.hide();
                                } else {
                                  toast.success("Đăng ký thành công.", {
                                    position: toast.POSITION.TOP_LEFT,
                                    autoClose: 500,
                                    onClose: () => {
                                      onLogin({
                                        username: values.phone,
                                        password: values.password,
                                      });
                                    },
                                  });
                                }
                              },
                            }
                          );
                        });
                      }
                    },
                  }
                );
              } else {
                f7.dialog.close();
                formikProps.setFieldError(
                  "phone",
                  "Số điện thoại đã được sử dụng."
                );
              }
            },
          }
        );
      } else {
        f7.preloader.show();
        regMutation.mutate(
          { ...values, stockid: CrStocks },
          {
            onSettled: ({ data }) => {
              if (data.error) {
                toast.error(data.error, {
                  position: toast.POSITION.TOP_LEFT,
                  autoClose: 3000,
                });
                f7.preloader.hide();
                if (data.error === "Mã giới thiệu không tồn tại") {
                  formikProps.setFieldError("FParentID", data.error);
                }
              } else {
                toast.success("Đăng ký thành công.", {
                  position: toast.POSITION.TOP_LEFT,
                  autoClose: 500,
                  onClose: () => {
                    onLogin({
                      username: values.phone,
                      password: values.password,
                    });
                  },
                });
              }
            },
          }
        );
      }
    }
  };

  const onLogin = (values) => {
    f7.preloader.show();
    DeviceHelpers.get({
      success: ({ deviceId }) => {
        loginMutation.mutate(
          { ...values, deviceid: deviceId },
          {
            onSettled: ({ data }) => {
              if (data.error || data?.Status === -1) {
                toast.error(
                  data?.Status === -1
                    ? "Tài khoản của bạn đã bị vô hiệu hoá."
                    : "Tài khoản & mật khẩu không chính xác.",
                  {
                    position: toast.POSITION.TOP_LEFT,
                    autoClose: 3000,
                  }
                );
                f7.preloader.hide()
              } else {
                setUserStorage(data.token, data);
                setUserLoginStorage(values.username, values.password);
                data?.ByStockID && setStockIDStorage(data.ByStockID);
                data?.StockName && setStockNameStorage(data.StockName);
                SEND_TOKEN_FIREBASE().then(async ({ error, Token }) => {
                  if (!error && Token) {
                    firebaseMutation.mutate(
                      {
                        Token: Token,
                        ID: data.ID,
                        Type: data.acc_type,
                      },
                      {
                        onSettled: () => {
                          f7.preloader.hide();
                          f7router.navigate("/", {
                            animate: true,
                            transition: "f7-flip",
                          });
                        },
                      }
                    );
                  } else {
                    setSubscribe(data, () => {
                      f7.preloader.hide();
                      f7router.navigate("/", {
                        animate: true,
                        transition: "f7-flip",
                      });
                    });
                  }
                  f7.preloader.hide()
                });
              }
            },
          }
        );
      },
    });
  };
  return (
    <PickerVerify f7={f7}>
      {({ open }) => (
        <Formik
          initialValues={initialValues}
          onSubmit={(values, formikProps) =>
            onSubmit(values, { ...formikProps, open })
          }
          enableReinitialize={true}
          validationSchema={regSchema}
        >
          {(formikProps) => {
            const {
              values,
              touched,
              errors,
              handleChange,
              handleBlur,
              setFieldValue,
            } = formikProps;

            return (
              <Form>
                <div className="title">Tạo tài khoản mới</div>
                <div className="page-login__form-item">
                  <div>
                    <input
                      type="text"
                      name="fullname"
                      autoComplete="off"
                      value={values.fullname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Họ và tên"
                      className={clsx(
                        "input-customs",
                        errors.fullname &&
                          touched.fullname &&
                          "is-invalid solid-invalid"
                      )}
                    />
                  </div>
                  {errors.fullname && touched.fullname && (
                    <div className="text-danger font-size-min mt-3px">
                      {errors.fullname}
                    </div>
                  )}
                </div>
                <div className="page-login__form-item">
                  <div>
                    <NumberFormat
                      autoComplete="off"
                      name="phone"
                      className={clsx(
                        "input-customs",
                        errors.phone &&
                          touched.phone &&
                          "is-invalid solid-invalid"
                      )}
                      value={values.phone}
                      thousandSeparator={false}
                      placeholder="Số điện thoại"
                      onValueChange={(val) => {
                        setFieldValue("phone", val.value);
                      }}
                      allowLeadingZeros
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <div className="text-danger font-size-min mt-3px">
                      {errors.phone}
                    </div>
                  )}
                </div>
                {/* <div className="page-login__form-item">
                  <div>
                    <input
                      type="date"
                      name="birth"
                      autoComplete="off"
                      value={values.birth}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ngày sinh"
                      className={clsx(
                        "input-customs",
                        errors.birth &&
                          touched.birth &&
                          "is-invalid solid-invalid"
                      )}
                    />
                  </div>
                  {errors.birth && touched.birth && (
                    <div className="text-danger font-size-min mt-3px">
                      {errors.birth}
                    </div>
                  )}
                </div> */}
                <div className="page-login__form-item">
                  <Select
                    options={[
                      {
                        label: "Nam",
                        value: "1",
                      },
                      {
                        label: "Nữ",
                        value: "0",
                      },
                      {
                        label: "Khác",
                        value: "-1",
                      },
                    ]}
                    className="select-control"
                    classNamePrefix="select"
                    placeholder="Giới tính"
                    noOptionsMessage={() => "Không có dữ liệu"}
                    value={values.gender}
                    onChange={(val) => setFieldValue("gender", val)}
                    isClearable={true}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                    menuPortalTarget={document.body}
                  />
                </div>
                <div className="page-login__form-item">
                  <div>
                    <input
                      type="text"
                      name="address"
                      autoComplete="off"
                      value={values.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Địa chỉ"
                      className={clsx(
                        "input-customs",
                        errors.address &&
                          touched.address &&
                          "is-invalid solid-invalid"
                      )}
                    />
                  </div>
                  {errors.address && touched.address && (
                    <div className="text-danger font-size-min mt-3px">
                      {errors.address}
                    </div>
                  )}
                </div>
                <div className="page-login__form-item">
                  <div className="position-relative">
                    <input
                      type={isShowPwd ? "text" : "password"}
                      name="password"
                      autoComplete="off"
                      placeholder="Mật khẩu"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={clsx(
                        "input-customs",
                        errors.password &&
                          touched.password &&
                          "is-invalid solid-invalid"
                      )}
                    />
                    {values.password && (
                      <div
                        className="clear-value"
                        onClick={() => {
                          setIsShowPwd(!isShowPwd);
                        }}
                      >
                        {!isShowPwd && <i className="las la-eye-slash"></i>}
                        {isShowPwd && <i className="las la-eye"></i>}
                      </div>
                    )}
                  </div>
                  {errors.password && touched.password && (
                    <div className="text-danger font-size-min mt-3px">
                      {errors.password}
                    </div>
                  )}
                </div>
                <div className="page-login__form-item">
                  <div className="position-relative">
                    <input
                      type={isShowRePwd ? "text" : "password"}
                      name="repassword"
                      autoComplete="off"
                      placeholder="Nhập lại mật khẩu"
                      value={values.repassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={clsx(
                        "input-customs",
                        errors.repassword &&
                          touched.repassword &&
                          "is-invalid solid-invalid"
                      )}
                    />
                    {values.repassword && (
                      <div
                        className="clear-value"
                        onClick={() => {
                          setIsShowRePwd(!isShowRePwd);
                        }}
                      >
                        {!isShowRePwd && <i className="las la-eye-slash"></i>}
                        {isShowRePwd && <i className="las la-eye"></i>}
                      </div>
                    )}
                  </div>
                  {errors.repassword && touched.repassword && (
                    <div className="text-danger font-size-min mt-3px">
                      {errors.repassword}
                    </div>
                  )}
                </div>
                <div className="page-login__form-item">
                  <div>
                    <input
                      type="text"
                      name="FParentID"
                      autoComplete="off"
                      value={values.FParentID}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Mã giới thiệu"
                      className={clsx(
                        "input-customs",
                        errors.FParentID &&
                          touched.FParentID &&
                          "is-invalid solid-invalid"
                      )}
                    />
                  </div>
                  {errors.FParentID && touched.FParentID && (
                    <div className="text-danger font-size-min mt-3px">
                      {errors.FParentID}
                    </div>
                  )}
                </div>
                <div className="mt-12px">
                  <div className="d--f">
                    <label className="checkbox_1">
                      <input
                        id="view"
                        type="checkbox"
                        name="isTerms"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        checked={values.isTerms}
                      />
                      <span className="icon"></span>
                      <span className="text">Đồng ý với các</span>
                    </label>
                    <span
                      className="text-primary text-underline pl-5px"
                      style={{
                        fontSize: "13px",
                      }}
                      onClick={() => setOpened(true)}
                    >
                      điều khoản sử dụng.
                    </span>
                    <Sheet
                      className="_sheet"
                      style={{
                        height: "80%",
                        "--f7-sheet-bg-color": "#fff",
                        borderRadius: "20px 20px 0 0",
                      }}
                      swipeToClose
                      backdrop
                      opened={opened}
                      onSheetClosed={() => setOpened(false)}
                    >
                      {data && (
                        <div className="h-100 overflow-auto px-15px py-20px bz-bb">
                          <div
                            className="text-uppercase mb-15px"
                            style={{
                              fontSize: "18px",
                              fontWeight: "600",
                            }}
                          >
                            {data.Title}
                          </div>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: fixedContentDomain(data?.Desc),
                            }}
                          ></div>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: fixedContentDomain(data?.Content),
                            }}
                          ></div>
                        </div>
                      )}
                    </Sheet>
                  </div>
                </div>
                <div className="page-login__form-item mt-15px">
                  <button
                    type="submit"
                    className="btn-login btn-me"
                    disabled={!values.isTerms}
                  >
                    <span>Đăng ký</span>
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      )}
    </PickerVerify>
  );
}

export default FormRegistration;
