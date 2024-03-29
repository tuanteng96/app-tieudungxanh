import React, { useState } from "react";
import { Link, Navbar, Page, Sheet } from "framework7-react";
import NotificationIcon from "../../components/NotificationIcon";
import userService from "../../service/user.service";
import { formatPoint, formatPriceVietnamese } from "../../constants/format";
import { SERVER_APP } from "../../constants/config";
import PageNoData from "../../components/PageNoData"

import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");

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
            <div className="fw-500">{item.Value < 0 ? "Thanh toán đơn hàng" : item.MoneyTitle}</div>
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
              {formatPoint(Math.abs(item.Value))}
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
      Member: null,
      loading: true,
      showPreloader: false,
    };
  }

  componentDidMount() {
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
            Member: data,
            loading: false,
          });
        }
        callback && callback();
      })
      .catch((err) => console.log(err));
  };

  loadRefresh(done) {
    this.setState({
      showPreloader: true,
    });
    this.getMembers(() => {
      done();
    });
  }

  render() {
    const { Member, loading } = this.state;

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
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Lịch sử điểm thưởng</span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="h-100 bg-white">
          <div>
            {loading && <div className="p-15px">Đang tải...</div>}
            {!loading && (
              <>
                {Member &&
                  Member.MoneyKinds &&
                  Member.MoneyKinds["[Tặng điểm]"] &&
                  Member.MoneyKinds["[Tặng điểm]"].length > 0 &&
                  Member.MoneyKinds["[Tặng điểm]"].map((item, index) => (
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
                            <div
                              className="mb-2px"
                              style={{ color: "#a3a1a0" }}
                            >
                              {moment(item.CreateDate).format(
                                "HH:mm DD-MM-YYYY"
                              )}
                            </div>
                            <div className="fw-500">{item.Value < 0 ? "Thanh toán đơn hàng" : item.MoneyTitle}</div>
                          </div>
                          <div
                            className="d--f fd--c ai--fe"
                            style={{
                              width: "100px",
                            }}
                          >
                            {/* {item.Value < 0 && (
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
                            )} */}

                            <div
                              style={{
                                fontFamily: "Archivo Narrow",
                                fontSize: "16px",
                                fontWeight: "600",
                              }}
                            >
                              {item.Value > 0 ? "+" : "-"}
                              {formatPoint(Math.abs(item.Value))}
                            </div>
                          </div>
                        </div>
                      )}
                    </PickerModal>
                  ))}
                {(!Member ||
                  !Member.MoneyKinds ||
                  !Member.MoneyKinds["[Tặng điểm]"] ||
                  (Member.MoneyKinds["[Tặng điểm]"] &&
                    Member.MoneyKinds["[Tặng điểm]"].length === 0)) && (
                  <PageNoData text="Không có dữ liệu." />
                )}
              </>
            )}
          </div>
        </div>
      </Page>
    );
  }
}
