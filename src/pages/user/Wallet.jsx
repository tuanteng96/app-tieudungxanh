import React, { useState } from "react";
import {
  Page,
  Link,
  Navbar,
  Toolbar,
  Tabs,
  Tab,
  Row,
  Col,
  Subnavbar,
  Button,
  Sheet,
  f7,
  ListItem,
} from "framework7-react";
import ToolBarBottom from "../../components/ToolBarBottom";
import UserService from "../../service/user.service";
import { getUser } from "../../constants/user";
import { maxBookDate, formatPriceVietnamese } from "../../constants/format";
import moment from "moment";
import "moment/locale/vi";
import NotificationIcon from "../../components/NotificationIcon";
import Skeleton from "react-loading-skeleton";
import PageNoData from "../../components/PageNoData";
import NumberFormat from "react-number-format";
import clsx from "clsx";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import userService from "../../service/user.service";
import { toast } from "react-toastify";
import { SERVER_APP } from "../../constants/config";
import { useQuery } from "react-query";
import axios from "axios";

moment.locale("vi");

const MUA_HANG = "MUA_HANG";
const HOAN_TIEN = "HOAN_TIEN";
const NAP_QUY = "NAP_QUY";

const vietnamesText = (item) => {
  switch (true) {
    case item.Type === "NAP_QUY" && item.Source === "" && item.Value >= 0:
      return "Hoa hồng";
    case item.Type === "NAP_QUY" && item.Value < 0 && item.Source === "":
      return "Rút tiền";
    case item.Source === "CHINH_SUA_SO_BUOI_DV":
      return "Hoàn tiền khi hoàn buổi dịch vụ";
    case item.Type === "MUA_HANG" &&
      item?.Desc.indexOf("KHAU_TRU_TRA_HANG") === -1:
      return "Tích lũy mua hàng";
    case item.Type === "MUA_HANG" &&
      item?.Desc.indexOf("KHAU_TRU_TRA_HANG") > -1:
      return "Giảm bớt tích lũy do trả hàng";
    case item.SumType === "TRA_HANG_HOAN_VI":
      return "Hoàn tiền khi trả hàng";
    case item.SumType === "TRA_HANG_PHI_VI":
      return "Phí dịch vụ trả hàng";
    case item.Type === "GIOI_THIEU" &&
      item?.Desc.indexOf("KHAU_TRU_TRA_HANG") === -1:
      return "Hoa hồng giới thiệu";
    case item.Type === "GIOI_THIEU" &&
      item?.Desc.indexOf("KHAU_TRU_TRA_HANG") > -1:
      return "Giảm bớt hoa hồng do trả hàng";
    case item.Type === "CHIA_SE_MAGIAMGIA":
      return "Hoa hồng giới thiệu ( Chia sẻ voucher )";
    case item.SumType === "KET_THUC_THE_HOAN_VI":
      return "Hoàn tiền khi kết thúc thẻ";
    case item.SumType === "KET_THUC_THE_PHI_VI":
      return "Phí dịch vụ kết thúc thẻ";
    case item.SumType === "DANG_KY_THANH_VIEN":
      return "Ưu đãi đăng ký tài khoản";
    case item.SumType === "DANG_NHAP_LAN_DAU":
      return "Ưu đãi khi đăng nhập lần đầu";
    case item.SumType === "CHUC_MUNG_SN":
      return "Ưu đãi mừng sinh nhật";
    case item.SumType === "CHUC_MUNG_SN_THANG":
      return "Ưu đãi tháng sinh nhật";
    case item.Type === "THANH_TOAN_DH":
      return "Thanh toán đơn hàng";
    case item.Type === "PHI" && item.SumType === "":
      return "Phí dịch vụ";
    default:
      return "Chưa xác định";
  }
};

function eq(a, b) {
  if (a.Type === NAP_QUY) return false;
  if (
    a.Type === b.Type &&
    a.SourceID === b.SourceID &&
    a.RefOrderID == b.RefOrderID
  )
    return true;

  return false;
}
class MM {
  data = {
    Items: [],
    MemberMoneys: [],
    Form: {},
    Cashs: [],
    Methods: [],
    P: {
      Value: 0,
      MethodPayID: 1,
      Desc: "",
    },
    ShowTable: true,
    Grouped: [],
    remainPayed: {
      OrderIDs: [],
      OrderItemIDs: [],
    },
    //for app21
    KHONG_DATCOC: true,
    KHONG_NAPVI: true,
    ///Mode: _opt && _opt.key && _opt.key.KHONG_DATCOC === false ? 'DAT_COC' : 'NAP_VI',

    //on app
    TypeDesc: {
      MUA_HANG: "Tích lũy mua hàng",
      THANH_TOAN_DH: "Thanh toán đơn hàng",
      NAP_QUY: "Nạp tiền ví điện tử",
    },
  };

  GroupItem() {
    var t = this;
    var data = t.data;
    data.Items.forEach(function (x) {
      var _z = null;
      t.data.Grouped.every(function (z) {
        if (eq(x, z)) _z = z;
        return _z === null;
      });
      if (_z === null) {
        data.Grouped.push(x);
      } else {
        _z.Value += x.Value;
      }

      switch (x.Source) {
        case "OrderEnt":
        case "vOrderEnt":
          if (
            data.remainPayed.OrderIDs &&
            (data.remainPayed.OrderIDs.indexOf(x.SourceID) > -1 ||
              data.remainPayed.OrderIDs.indexOf(x.RefOrderID) > -1)
          )
            x.IsOrderRemainPay = true;
          break;
        case "OrderItemEnt":
        case "vOrderItemEnt":
          if (
            data.remainPayed.OrderItemIDs &&
            (data.remainPayed.OrderItemIDs.indexOf(x.SourceID) > -1 ||
              data.remainPayed.OrderIDs.indexOf(x.RefOrderID) > -1)
          )
            x.IsOrderRemainPay = true;
          break;
      }
    });
  }
  sumAvai(NAP_VI, NoOrderRemainPay) {
    var tt = 0;
    var data = this.data;
    data.Grouped.forEach(function (x) {
      var v = 0;
      if (NAP_VI && x.Desc.indexOf("DATCOC:") !== 0) v = x.Value;
      if (!NAP_VI && x.Desc.indexOf("DATCOC:") === 0) v = x.Value;

      if (x.IsOrderRemainPay && NoOrderRemainPay === undefined) {
        //Đơn hàng chưa thanh toán hết, các khoản tích lũy sẽ ko đc cộng dồn
        //Giá trị có thể âm trong th khấu trừ trả hàng
        v = v > 0 ? 0 : v; //2020-10/20: fixed tạm tích luuyx sẽ ko đc tính, nếu chưa thanh toán hết. các th còn lại đều đc tính
        //* có rất nhiều th cần xem xết cẩn thận
      }

      tt += v;
    });
    return tt;
  }
  totalWallet() {
    return this.data.Grouped.reduce((n, { Value }) => n + Value, 0);
  }
  availableWallet() {
    return this.data.Grouped.filter((item) => {
      return item.Type === "MUA_HANG" ||
        item.Type === "GIOI_THIEU" ||
        item.Type === "CHIA_SE_MAGIAMGIA"
        ? item.Order?.RemainPay === 0
        : item;
    }).reduce((n, { Value }) => n + Value, 0);
  }
  calc() {
    var data = this.data;
    data.Items.forEach(function (x) {
      var c = null;

      if (data.Cashs)
        data.Cashs.every(function (z) {
          if (z.SourceID === x.ID) c = z.Value;
          return c === null;
        });

      x.CashValue = c || 0;
    });
  }
  constructor(rt) {
    var t = this;
    t.data.Grouped.length = 0;
    t.data.Items = rt.data || [];
    t.data.Cashs = rt.cash || [];
    t.data.remainPayed = rt.remainPayed;
    t.calc();
    t.GroupItem();
  }
}

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

const walletSchema = Yup.object().shape({
  value: Yup.string().required("Vui lòng nhập số tiền cần rút."),
});

const banksSchema = Yup.object().shape({
  STK: Yup.string().required("Vui lòng nhập số tài khoản."),
  NH: Yup.string().required("Vui lòng nhập tên ngân hàng."),
  CTK: Yup.string().required("Vui lòng nhập tên chủ tài khoản."),
  // CN: Yup.string().required("Vui lòng nhập chi nhánh."),
});

const FormWallet = ({ onSubmit, total, min }) => {
  return (
    <Formik
      initialValues={{
        value: "",
      }}
      onSubmit={(values, formikProps) => onSubmit(values, { ...formikProps })}
      enableReinitialize={true}
      validationSchema={walletSchema}
    >
      {(formikProps) => {
        const {
          values,
          touched,
          errors,
          handleChange,
          handleBlur,
          setFieldValue,
          setFieldError,
        } = formikProps;

        return (
          <Form>
            <div
              className="mt-15px bg-white p-15px"
              style={{
                borderRadius: "8px",
              }}
            >
              <div className="fw-500">
                Thực hiện rút tiền - Ví khả dụng :
                <span
                  className="text-danger pl-2px"
                  style={{
                    fontFamily: "Archivo Narrow",
                    fontWeight: "700",
                  }}
                >
                  {formatPriceVietnamese(total)}
                </span>
              </div>
              <div className="mt-15px">
                <div>
                  <div className="mb-5px" style={{ color: "#B5B5C3" }}>
                    Số tiền rút tối thiểu :
                    <span
                      className="pl-2px text-danger"
                      style={{
                        fontFamily: "Archivo Narrow",
                        fontWeight: "600",
                      }}
                    >
                      {formatPriceVietnamese(min)}
                    </span>
                  </div>
                  <NumberFormat
                    className={clsx("inputs")}
                    value={values.value}
                    thousandSeparator={true}
                    placeholder="Nhập số tiền"
                    onValueChange={(val) => {
                      setFieldValue(
                        "value",
                        val.floatValue ? val.floatValue : val.value
                      );
                    }}
                    allowLeadingZeros={true}
                    // isAllowed={(values) => {
                    //   const { floatValue } = values;
                    //   return floatValue < total;
                    // }}
                  />
                  {values.value && Number(values.value) > Number(total) && (
                    <div className="text-danger font-size-min mt-5px">
                      Số tiền rút vượt quá số dư ví hiện tại.
                    </div>
                  )}
                </div>
                <div className="mt-15px">
                  <button
                    type="submit"
                    className="btn btn-login"
                    style={{
                      boxShadow: "none",
                    }}
                    disabled={
                      !values.value ||
                      (values.value && Number(values.value) > Number(total)) ||
                      (values.value && Number(values.value) < Number(min))
                    }
                  >
                    Thực hiện rút
                  </button>
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

const FormBanks = ({ onSubmit }) => {
  let { data: ListBanks, isLoading } = useQuery({
    queryKey: ["BANKS"],
    queryFn: async () => {
      let { data } = await axios.get("https://api.vietqr.io/v2/banks");
      return data?.data ? data?.data.map((x) => `${x.name}`) : [];
    },
  });

  return (
    <Formik
      initialValues={{
        STK: "",
        NH: "",
        CTK: "",
        // CN: "",
      }}
      onSubmit={(values, formikProps) => onSubmit(values, { ...formikProps })}
      enableReinitialize={true}
      validationSchema={banksSchema}
    >
      {(formikProps) => {
        const {
          values,
          touched,
          errors,
          handleChange,
          handleBlur,
          setFieldValue,
          setFieldError,
        } = formikProps;

        return (
          <Form className="h-100 bg-white">
            <div className="p-15px">
              <div className="mb-20px" style={{ color: "#B5B5C3" }}>
                Bạn cần cập nhập thông tin tài khoản trước khi thực hiện rút
                tiền.
              </div>
              <div className="mt-15px">
                <div className="mb-15px">
                  <div className="mb-3px">Số tài khoản</div>
                  <NumberFormat
                    className={clsx(
                      "inputs",
                      errors.STK && touched.STK && "error"
                    )}
                    value={values.STK}
                    thousandSeparator={false}
                    placeholder="Nhập số tài khoản"
                    onValueChange={(val) => {
                      setFieldValue(
                        "STK",
                        val.floatValue ? val.floatValue : val.value
                      );
                    }}
                    allowLeadingZeros={true}
                  />
                  {errors.STK && touched.STK && (
                    <div className="text-danger font-size-min mt-5px">
                      {errors.STK}
                    </div>
                  )}
                </div>
                <div className="mb-15px">
                  <div className="mb-3px">Chủ tài khoản</div>
                  <input
                    name="CTK"
                    className={clsx(
                      "inputs bz-bb",
                      errors.CTK && touched.CTK && "error"
                    )}
                    value={values.CTK}
                    placeholder="Nhập tên chủ tài khoản"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.CTK && touched.CTK && (
                    <div className="text-danger font-size-min mt-5px">
                      {errors.CTK}
                    </div>
                  )}
                </div>
                <div className="mb-15px">
                  <div className="mb-3px">Tên ngân hàng</div>
                  <div
                    className={clsx(
                      "position-relative select-popup",
                      !values.NH && "no-value",
                      errors.NH && touched.NH && "error"
                    )}
                  >
                    <ListItem
                      key={ListBanks}
                      title="Ngân hàng"
                      smartSelect
                      smartSelectParams={{
                        openIn: "popup",
                        searchbar: true,
                        searchbarPlaceholder: "Nhập tên ngân hàng",
                        popupCloseLinkText: "Đóng",
                        searchbarDisableText: "Huỷ",
                        //closeOnSelect: true,
                      }}
                    >
                      <select
                        name="NH"
                        placeholder="Chọn ngân hàng"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.NH || ""}
                      >
                        <option value="" disabled>
                          Chọn ngân hàng
                        </option>
                        {ListBanks &&
                          ListBanks.map((item, index) => (
                            <option value={item} key={index}>
                              {item}
                            </option>
                          ))}
                      </select>
                    </ListItem>
                    <i className="i-r las la-angle-right"></i>
                  </div>
                  {errors.NH && touched.NH && (
                    <div className="text-danger font-size-min mt-5px">
                      {errors.NH}
                    </div>
                  )}
                </div>
                <div className="mt-15px">
                  <button
                    type="submit"
                    className="btn btn-login"
                    style={{
                      boxShadow: "none",
                    }}
                  >
                    Cập nhập
                  </button>
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

const PickerModal = ({ children, item }) => {
  const [opened, setOpened] = useState(false);
  return (
    <>
      {children({
        open: () => setOpened(true),
      })}
      <Sheet
        opened={opened}
        onSheetClosed={() => {
          setOpened(false);
        }}
        className="sheet-swipe-product"
        style={{ height: "auto", "--f7-sheet-bg-color": "#fff" }}
        swipeToClose
        swipeToStep
        backdrop
      >
        <div
          className="d--f ai--c py-15px px-15px"
          style={{ borderBottom: "1px solid #ebedf3" }}
        >
          <div className="d--f jc--c ai--c">
            <div
              className="d--f jc--c ai--c"
              style={{
                background: "#F3F6F9",
                width: "45px",
                height: "45px",
                borderRadius: "100%",
                fontSize: "20px",
                color: item.Value > 0 ? "#1BC5BD" : "#F64E60",
              }}
            >
              {item.Value > 0 ? (
                <i className="las la-arrow-up"></i>
              ) : (
                <i className="las la-arrow-down"></i>
              )}
            </div>
          </div>
          <div className="px-15px f--1">
            <div className="mb-2px" style={{ color: "#a3a1a0" }}>
              {moment(item.CreateDate).format("HH:mm DD-MM-YYYY")}
            </div>
            <div className="fw-500">{vietnamesText(item)}</div>
          </div>
          <div
            className="d--f fd--c ai--fe"
            style={{
              width: "100px",
            }}
          >
            {item.Value < 0 && (
              <div className="mb-2px">
                {item.Status !== "HOAN_THANH" ? (
                  <span className="text-warning">Đang xử lý</span>
                ) : (
                  <span className="text-success">Hoàn thành</span>
                )}
              </div>
            )}

            <div
              style={{
                fontFamily: "Archivo Narrow",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {item.Value > 0 ? "+" : ""}
              {formatPriceVietnamese(item.Value)}
            </div>
          </div>
        </div>
        {(item.Desc || item?.BillSrc) && (
          <div className="p-20px">
            <div
              style={{
                fontSize: "16px",
                lineHeight: "25px",
              }}
            >
              {item.Desc}
            </div>
            {item?.BillSrc && (
              <div>
                <img
                  src={SERVER_APP + "/upload/image/" + item?.BillSrc}
                  alt=""
                />
              </div>
            )}
          </div>
        )}
      </Sheet>
    </>
  );
};

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      arrWallet: [],
      totalWallet: 0, // Ví
      demonsWallet: 0, // Quỷ
      depositWallet: 0, // Đặt cọc
      showPreloader: false,
      arrCardWallet: [],
      tabCurrent: "wallet",
      sheetOpened: {
        open: false,
        ID: null,
        item: null,
      },
      loading: false,
      minWallet: 0,
      memberInfo: {},
      loadingMember: true,
    };
  }
  componentDidMount() {
    this.getWallet();
    this.getMinWallet();
    this.getMembers();
  }

  getMembers = (callback) => {
    userService
      .getInfo()
      .then(({ data }) => {
        if (data.error) {
          this.$f7router.navigate("/login/");
        } else {
          this.setState({
            memberInfo: data,
            loadingMember: false,
          });
        }
        callback && callback();
      })
      .catch((err) => console.log(err));
  };

  getWallet = (callback) => {
    const infoUser = getUser();
    if (!infoUser) return false;
    const memberid = infoUser.ID;
    var bodyFormData = new FormData();
    bodyFormData.append("cmd", "list_money");
    bodyFormData.append("MemberID", memberid);
    this.setState({ loading: true });
    UserService.getWallet(bodyFormData)
      .then((response) => {
        const arrWallet = response.data.data;
        var mm = new MM(clone(response.data));
        this.setState({
          arrWallet: arrWallet,
          totalWallet: mm.totalWallet(), // Tổng Ví
          demonsWallet: mm.availableWallet(), // Ví khả dụng
          depositWallet: mm.sumAvai(false), // Đặt cọc
          //totalWallet: mm.sumAvai(true), // Ví
          //demonsWallet: mm.sumAvai(true, true), // Quỷ
          //depositWallet: mm.sumAvai(false), // Đặt cọc,
          loading: false,
        });
        callback && callback();
      })
      .catch((e) => console.log(e));
  };

  getMinWallet = () => {
    userService
      .getConfig("tdx_min_rut")
      .then(({ data }) => {
        this.setState({
          minWallet:
            data?.data && data?.data.length > 0
              ? Number(data?.data[0].Value)
              : 0,
        });
      })
      .catch((error) => console.log(error));
  };

  loadRefresh(done) {
    setTimeout(() => {
      this.setState({
        showPreloader: true,
      });
      this.getWallet();
      done();
    }, 600);
  }

  onSubmitBanks = (value) => {
    f7.dialog.preloader("Đang cập nhập...");
    userService
      .updateFtree({
        members: [
          {
            ID: getUser().ID,
            BankInfo: JSON.stringify(value),
          },
        ],
      })
      .then(() => {
        this.getMembers(() => {
          f7.dialog.close();
          toast.success("Cập nhập thành công.", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });
        });
      });
  };

  onSubmitWallet = (values, formikProps) => {
    f7.dialog.preloader("Đang thực hiện...");
    userService
      .drawMoney({
        draw: {
          MemberID: getUser().ID,
          Value: values.value,
        },
      })
      .then(() => {
        this.getMembers(() => {
          this.getWallet(() => {
            f7.dialog.close();
            toast.success(
              "Thực hiện rút tiền thành công. Vui lòng đợi kiểm duyệt",
              {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1000,
              }
            );
            formikProps.resetForm();
          });
        });
      });
  };

  render() {
    const {
      arrWallet,
      totalWallet,
      demonsWallet,
      loadingMember,
      tabCurrent,
      minWallet,
      loading,
      memberInfo,
    } = this.state;

    return (
      <Page
        //noNavbar
        noToolbar
        name="wallet"
        className="wallet"
        ptr
        infiniteDistance={50}
        infinitePreloader={this.state.showPreloader}
        onPtrRefresh={this.loadRefresh.bind(this)}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link
                onClick={() => {
                  if (
                    this.$f7.views.main.router.history &&
                    this.$f7.views.main.router.history.length > 2 &&
                    this.$f7.views.main.router.history[
                      this.$f7.views.main.router.history.length - 2
                    ] === "/profile/"
                  ) {
                    this.$f7.views.main.router.navigate(`/profile/`, {
                      //reloadCurrent: true,
                      ignoreCache: true,
                    });
                  } else {
                    this.$f7router.back();
                  }
                }}
              >
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Ví điện tử / Rút tiền</span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
          <Subnavbar className="wallet-subnavbar">
            <div className="wallet-subnavbar-list">
              <Link
                noLinkClass
                tabLinkActive={tabCurrent === "wallet"}
                onClick={() => this.setState({ tabCurrent: "wallet" })}
              >
                Lịch sử
              </Link>
              <Link
                noLinkClass
                tabLinkActive={tabCurrent === "card"}
                onClick={() =>
                  !loadingMember && this.setState({ tabCurrent: "card" })
                }
              >
                Rút tiền
              </Link>
            </div>
          </Subnavbar>
        </Navbar>
        <Tabs className="h-100">
          <Tab
            className="h-100"
            id="wallet"
            tabActive={tabCurrent === "wallet"}
          >
            <div className="h-100 bg-white overflow-auto">
              <div>
                {loading && <div className="p-15px">Đang tải...</div>}
                {!loading && (
                  <>
                    {arrWallet &&
                      arrWallet.length > 0 &&
                      arrWallet.map((item, index) => (
                        <PickerModal item={item} key={index}>
                          {({ open }) => (
                            <div
                              className="d--f ai--c py-15px px-15px"
                              style={{ borderBottom: "1px solid #ebedf3" }}
                              onClick={open}
                            >
                              <div className="d--f jc--c ai--c">
                                <div
                                  className="d--f jc--c ai--c"
                                  style={{
                                    background: "#F3F6F9",
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "100%",
                                    fontSize: "20px",
                                    color:
                                      item.Value > 0 ? "#1BC5BD" : "#F64E60",
                                  }}
                                >
                                  {item.Value > 0 ? (
                                    <i className="las la-arrow-up"></i>
                                  ) : (
                                    <i className="las la-arrow-down"></i>
                                  )}
                                </div>
                              </div>
                              <div className="px-15px f--1">
                                <div
                                  className="mb-2px"
                                  style={{ color: "#a3a1a0" }}
                                >
                                  {moment(item.CreateDate).format(
                                    "HH:mm DD-MM-YYYY"
                                  )}
                                </div>
                                <div className="fw-500">
                                  {vietnamesText(item)}
                                </div>
                              </div>
                              <div
                                className="d--f fd--c ai--fe"
                                style={{
                                  width: "100px",
                                }}
                              >
                                {item.Value < 0 && (
                                  <div className="mb-2px">
                                    {item.Status !== "HOAN_THANH" ? (
                                      <span className="text-warning">
                                        Đang xử lý
                                      </span>
                                    ) : (
                                      <span className="text-success">
                                        Hoàn thành
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div
                                  style={{
                                    fontFamily: "Archivo Narrow",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {item.Value > 0 ? "+" : ""}
                                  {formatPriceVietnamese(item.Value)}
                                </div>
                              </div>
                            </div>
                          )}
                        </PickerModal>
                      ))}
                    {(!arrWallet || arrWallet.length === 0) && <PageNoData />}
                  </>
                )}
              </div>
            </div>
          </Tab>
          <Tab className="h-100 overflow-auto" id="card" tabActive={tabCurrent === "card"}>
            {memberInfo?.BankInfo ? (
              <div className="wallet-card">
                <div
                  className="bg-white"
                  style={{
                    borderRadius: "8px",
                  }}
                >
                  <div
                    className="d--f px-15px py-12px"
                    style={{ borderBottom: "1px solid #ebedf3" }}
                  >
                    <div className="f--1" style={{ color: "#333" }}>
                      Số tài khoản
                    </div>
                    <div
                      className="text-right"
                      style={{ width: "60%", fontWeight: "500" }}
                    >
                      {JSON.parse(memberInfo?.BankInfo)?.STK}
                    </div>
                  </div>
                  <div
                    className="d--f px-15px py-12px"
                    style={{ borderBottom: "1px solid #ebedf3" }}
                  >
                    <div className="f--1" style={{ color: "#333" }}>
                      Chủ tài khoản
                    </div>
                    <div
                      className="text-right"
                      style={{ width: "60%", fontWeight: "500" }}
                    >
                      {JSON.parse(memberInfo?.BankInfo)?.CTK}
                    </div>
                  </div>
                  <div
                    className="d--f px-15px py-12px"
                    style={{ borderBottom: "1px solid #ebedf3" }}
                  >
                    <div className="f--1" style={{ color: "#333" }}>
                      Ngân hàng
                    </div>
                    <div
                      className="text-right"
                      style={{ width: "60%", fontWeight: "500" }}
                    >
                      {JSON.parse(memberInfo?.BankInfo)?.NH}
                    </div>
                  </div>
                  {/* <div className="d--f px-15px py-12px">
                    <div className="f--1" style={{ color: "#333" }}>
                      Chi nhánh
                    </div>
                    <div
                      className="text-right"
                      style={{ width: "60%", fontWeight: "500" }}
                    >
                      {JSON.parse(memberInfo?.BankInfo)?.CN}
                    </div>
                  </div> */}
                  <div className="px-15px py-12px" style={{ color: "#B5B5C3" }}>
                    Bạn cần thay đổi thông tin tài khoản ngân hàng vui lòng liên
                    hệ ban quản trị.
                  </div>
                </div>
                <FormWallet
                  total={
                    memberInfo &&
                    memberInfo?.MoneyKinds &&
                    memberInfo?.MoneyKinds["Ví"]
                  }
                  min={minWallet}
                  onSubmit={this.onSubmitWallet}
                />
              </div>
            ) : (
              <FormBanks onSubmit={(val) => this.onSubmitBanks(val)} />
            )}
          </Tab>
        </Tabs>
      </Page>
    );
  }
}
